import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Shield } from "lucide-react";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRetypePassword, setSignupRetypePassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/setup");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome to SkySentinnel Dashboard"
      });
      navigate("/setup");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupRetypePassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, fullName);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="bg-dashboard-card border-border">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">SkySentinnel</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Access real-time video analytics platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signin">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input 
                      id="loginEmail" 
                      type="email" 
                      placeholder="admin@dashboard.com" 
                      value={loginEmail} 
                      onChange={e => setLoginEmail(e.target.value)} 
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="loginPassword" 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        value={loginPassword} 
                        onChange={e => setLoginPassword(e.target.value)} 
                        className="bg-input border-border pr-10"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" 
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      Full Name
                    </Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      placeholder="John Doe" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input 
                      id="signupEmail" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={signupEmail} 
                      onChange={e => setSignupEmail(e.target.value)} 
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input 
                        id="signupPassword" 
                        type={showSignupPassword ? "text" : "password"} 
                        placeholder="Choose a password" 
                        value={signupPassword} 
                        onChange={e => setSignupPassword(e.target.value)} 
                        className="bg-input border-border pr-10"
                        required
                        minLength={6}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" 
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retypePassword" className="text-sm font-medium text-foreground">
                      Retype Password
                    </Label>
                    <Input 
                      id="retypePassword" 
                      type="password" 
                      placeholder="Confirm your password" 
                      value={signupRetypePassword} 
                      onChange={e => setSignupRetypePassword(e.target.value)} 
                      className="bg-input border-border"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;