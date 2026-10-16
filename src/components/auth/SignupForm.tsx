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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { signupSchema, type SignupValues } from "@/lib/authSchemas";
import { applyApiError } from "@/lib/formErrors";
import { navigateAfterAuthChange, safeNextPath } from "@/lib/navigation";

export function SignupForm() {
  const signup = useSignup();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signup.mutateAsync(values);
      navigateAfterAuthChange(
        safeNextPath(new URLSearchParams(window.location.search).get("next")),
      );
    } catch (error) {
      // "Email is already registered" belongs under the email field.
      if (error instanceof ApiError && error.code === "CONFLICT") {
        form.setError("email", { message: error.message });
        return;
      }
      setFormError(applyApiError(error, ["name", "email", "password"], form.setError));
    }
  });

  return (
    <Card>
      <CardHeader>
        <BlurInText text="Create your account" />
        <CardDescription>Track what you solve and plan your practice.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                aria-invalid={!!errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

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
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby="password-hint"
                {...form.register("password")}
              />
              {errors.password ? (
                <FieldError errors={[errors.password]} />
              ) : (
                <FieldDescription id="password-hint">At least 8 characters.</FieldDescription>
              )}
            </Field>

            <FormError message={formError} />

            <Button type="submit" className="w-full" disabled={signup.isPending}>
              {signup.isPending ? "Creating account…" : "Create account"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </CardFooter>
    </Card>
  );
}
