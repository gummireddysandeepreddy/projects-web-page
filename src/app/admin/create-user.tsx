
import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";
import { generateId } from "lucia";

import type { ActionResult } from "@/lib/form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function CreateUser() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter Credentials to create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form action={signup}>
          <div className="grid gap-2">
            <Label htmlFor="username">User Name</Label>
            <Input id="username" type="text" name="username" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button className="w-full my-5">Create Account</Button>
        </Form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  console.log(username);
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31
  ) {
    console.log("Invalid username");
    return {
      error: "Invalid username",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateId(15);

  try {
    await db
      .execute({
        sql: "INSERT INTO user (id, username, password_hash) VALUES(?, ?, ?)",
        args: [userId, username, passwordHash],
      })
      .catch((e: any) => {
        return {
          error: e.node,
        };
      });

    // const session = await lucia.createSession(userId, {});
    // const sessionCookie = lucia.createSessionCookie(session.id);
    // cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  } catch (e: any) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        error: "Username already used",
      };
    }
    return {
      error: "An unknown error occurred",
    };
  }
  return redirect("/admin");
}
