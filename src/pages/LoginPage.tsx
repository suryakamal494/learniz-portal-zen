import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to teacher dashboard
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-premium">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-body-md text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-border/40 shadow-premium-lg backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-foreground flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Teacher Portal
            </CardTitle>
            <CardDescription className="text-center">
              Manage classes and student progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-label-md font-medium text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 px-4 rounded-xl border-border/50 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-label-md font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border-border/50 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 mt-6 text-label-md font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-premium hover:shadow-premium-lg transition-all duration-300 text-white"
                size="lg"
              >
                Sign In to Teacher Portal
              </Button>

              <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  className="text-body-sm text-primary hover:text-primary/80 transition-all duration-300 text-center font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-body-xs text-muted-foreground">
          Need help? Contact{" "}
          <button className="text-primary hover:text-primary/80 transition-all duration-300 font-medium">
            support@platform.com
          </button>
        </p>
      </div>
    </div>
  );
}
