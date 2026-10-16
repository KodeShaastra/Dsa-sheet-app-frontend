"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormError } from "@/components/auth/FormError";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { BlurInText } from "@/components/eldoraui/blur-in-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginValues } from "@/lib/authSchemas";
import { applyApiError } from "@/lib/formErrors";
import { navigateAfterAuthChange, safeNextPath } from "@/lib/navigation";

const DEMO = { email: "demo@dsasheet.dev", password: "Demo@1234" };

export function LoginForm() {
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      // Read ?next= only now, so the page itself doesn't depend on the URL (no Suspense needed).
      navigateAfterAuthChange(
        safeNextPath(new URLSearchParams(window.location.search).get("next")),
      );
    } catch (error) {
      setFormError(applyApiError(error, ["email", "password"], form.setError));
    }
  });

  const fillDemo = () => {
    form.setValue("email", DEMO.email, { shouldValidate: true });
    form.setValue("password", DEMO.password, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <BlurInText text="Welcome back" />
        <CardDescription>Log in to pick up where you left off.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <FormError message={formError} />

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Logging in…" : "Log in"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          <span>
            Demo: <span className="text-subtle-foreground">{DEMO.email}</span> /{" "}
            <span className="text-subtle-foreground">{DEMO.password}</span>
          </span>
          <Button type="button" variant="link" size="xs" className="h-auto px-0" onClick={fillDemo}>
            Fill in
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        New here?&nbsp;
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
}
