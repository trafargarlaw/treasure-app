import { swaggerLoginQueryParams } from "@/gen/endpoints/fastAPI.zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { userLogin } from "../gen/endpoints/fastAPI";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export function Login() {
  const form = useForm<z.infer<typeof swaggerLoginQueryParams>>({
    resolver: zodResolver(swaggerLoginQueryParams),
  });
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof swaggerLoginQueryParams>) => {
    try {
      const response = await userLogin({
        username: data.username,
        password: data.password,
      });
      const tokenData = response.data;

      if (!tokenData) {
        console.error(
          "Invalid username or password",
          "this error is not supposed to happen"
        );
        toast.error("Invalid username or password");
        return;
      }
      // Store the token securely
      const stored = await window.ipcRenderer.storeToken(
        tokenData.access_token
      );
      if (stored) {
        // Redirect to dashboard or home page
        console.log("Token stored successfully", tokenData.access_token);
        router.navigate({ to: "/" });
      } else {
        toast.error("Failed to login, this case is not supposed to happen");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.msg);
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <LogIn className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl text-center font-bold">
          Chasse au tresor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
