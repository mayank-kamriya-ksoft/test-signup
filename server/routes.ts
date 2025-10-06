import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import axios from "axios";
import { z } from "zod";

// CleanSignups API configuration
const CLEANSIGNUPS_API_KEY = process.env.CLEANSIGNUPS_API_KEY || "eg_live_cacf9685029843d6";
const CLEANSIGNUPS_ENDPOINT = "https://api.cleansignups.com/verify";

interface CleanSignupsResponse {
  isTemporary: boolean;
  isValid: boolean;
  qualityScore?: number;
  risks?: string[];
  error?: string;
}

async function verifyEmailWithCleanSignups(email: string): Promise<CleanSignupsResponse> {
  try {
    const response = await axios.post(
      CLEANSIGNUPS_ENDPOINT,
      { email },
      {
        headers: {
          'Authorization': `Bearer ${CLEANSIGNUPS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('CleanSignups API Error:', error);
    // If API fails, allow registration but log the error
    // In production, you might want to handle this differently
    return {
      isTemporary: false,
      isValid: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Email verification endpoint
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email } = z.object({ 
        email: z.string().email() 
      }).parse(req.body);

      const result = await verifyEmailWithCleanSignups(email);
      
      // Check if email is temporary or invalid
      if (result.isTemporary || !result.isValid) {
        return res.status(400).json({
          message: "Please use a valid email address",
          isTemporary: result.isTemporary,
          isValid: result.isValid,
          risks: result.risks || []
        });
      }

      res.json({
        message: "Email is valid",
        isValid: true,
        isTemporary: false
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        message: "Unable to verify email at this time"
      });
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Validate request body
      const userData = insertUserSchema.parse(req.body);
      
      // Verify email with CleanSignups API
      const emailVerification = await verifyEmailWithCleanSignups(userData.email);
      
      if (emailVerification.isTemporary || !emailVerification.isValid) {
        return res.status(400).json({
          message: "Please use a valid email address. Temporary or disposable emails are not allowed.",
          field: "email"
        });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Return user data without password
      const { password, ...userResponse } = user;
      
      res.status(201).json({
        message: "Registration successful",
        user: userResponse
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      
      if (error instanceof Error) {
        if (error.message.includes("email already exists")) {
          return res.status(409).json({
            message: error.message,
            field: "email"
          });
        }
        
        return res.status(400).json({
          message: error.message
        });
      }
      
      res.status(500).json({
        message: "Registration failed. Please try again."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
