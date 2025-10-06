import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Shield,
  Github
} from "lucide-react";

interface EmailVerificationResult {
  isValid: boolean;
  isTemporary: boolean;
  risks?: string[];
}

export default function Registration() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Email verification mutation
  const emailVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/verify-email", { email });
      return response.json() as Promise<EmailVerificationResult>;
    },
    onSuccess: () => {
      setEmailStatus('valid');
    },
    onError: () => {
      setEmailStatus('invalid');
    }
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully. Please check your email to verify your account.",
        variant: "default",
      });
      form.reset();
      setEmailStatus('idle');
      setPasswordStrength(0);
      setTermsAccepted(false);
    },
    onError: (error: any) => {
      const message = error.message || "Registration failed. Please try again.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 1: return "bg-destructive";
      case 2: return "bg-yellow-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-blue-500";
      case 5: return "bg-success";
      default: return "bg-muted";
    }
  };

  const getStrengthText = (strength: number): string => {
    switch (strength) {
      case 1: return "Weak password";
      case 2: return "Fair password";
      case 3: return "Fair password";
      case 4: return "Good password";
      case 5: return "Strong password";
      default: return "Enter at least 8 characters";
    }
  };

  // Handle email verification
  const handleEmailBlur = async () => {
    const email = form.getValues("email");
    if (email && form.formState.errors.email === undefined) {
      setEmailStatus('validating');
      emailVerificationMutation.mutate(email);
    }
  };

  // Handle password input
  const handlePasswordChange = (value: string) => {
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
    form.setValue("password", value);
  };

  // Handle form submission
  const onSubmit = (data: InsertUser) => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "You must agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (emailStatus !== 'valid') {
      toast({
        title: "Email Verification Required",
        description: "Please ensure your email address is verified",
        variant: "destructive",
      });
      return;
    }

    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us today and get started</p>
        </div>

        {/* Registration Card */}
        <Card className="border border-border shadow-lg">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Full Name
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            data-testid="input-name"
                            placeholder="John Doe"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Email Address
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            data-testid="input-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 pr-12"
                            onBlur={handleEmailBlur}
                          />
                          {/* Email Status Icon */}
                          <div className="absolute right-3 top-3 h-5 w-5">
                            {emailStatus === 'validating' && (
                              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                            )}
                            {emailStatus === 'valid' && (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            )}
                            {emailStatus === 'invalid' && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {emailStatus === 'invalid' && (
                        <p className="text-sm text-destructive">
                          Please use a valid email address. Temporary or disposable emails are not allowed.
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        We'll verify your email address with CleanSignups to ensure it's valid
                      </p>
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Password
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            data-testid="input-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-12"
                            onChange={(e) => handlePasswordChange(e.target.value)}
                          />
                          <button
                            type="button"
                            data-testid="button-toggle-password"
                            className="absolute right-3 top-3 h-5 w-5"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      
                      {/* Password Strength Indicator */}
                      {field.value && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-1 rounded-sm ${
                                  i < passwordStrength ? getStrengthColor(passwordStrength) : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs ${passwordStrength > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {getStrengthText(passwordStrength)}
                          </p>
                        </div>
                      )}
                      
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Use at least 8 characters with a mix of letters, numbers, and symbols
                      </p>
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      data-testid="checkbox-terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {!termsAccepted && form.formState.isSubmitted && (
                    <p className="text-sm text-destructive">
                      You must agree to the terms and conditions
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  data-testid="button-submit"
                  className="w-full"
                  disabled={registrationMutation.isPending}
                >
                  {registrationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Github className="w-5 h-5" />
                GitHub
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="#" className="text-primary font-medium hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Protected by CleanSignups email verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
