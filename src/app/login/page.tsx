
import { db } from "@/lib/db";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";

import type { ActionResult } from "@/lib/form";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function Page() {
	const { user } = await validateRequest();
	if (user?.username == "admin") {
		return redirect("/admin");
	}
	if (user) {
		return redirect("/");
	}
	return (
		<div className="flex justify-center items-center h-full">
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
				Enter your Credentials below to login.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Form action={login}>
					<div className="grid gap-2">
					<Label htmlFor="username">User Name</Label>
					<Input id="username" type="text" name="username"required />
					</div>
					<div className="grid gap-2">
					<Label htmlFor="password">Password</Label>
					<Input id="password" name="password" type="password" required />
					</div>
					<Button className="w-full">Sign in</Button>
				</Form>
			</CardContent>
			<CardFooter>
				{/* <Link href="/signup">Sign up</Link> */}
			</CardFooter>
		</Card>
		</div>
	)
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
	"use server";
	const username = formData.get("username");
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31
	) {
		return {
			error: "Invalid username"
		};
	}
	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: "Invalid password"
		};
	}

	const existingUsers = await db.execute({
		sql : "SELECT * FROM user WHERE username = ?",
		args : [username],
	});

	if (!existingUsers) {
		return {
			error: "Incorrect username or password"
		};
	}
	const existingUser = existingUsers.rows[0];
	const password_hash = existingUser.password_hash as string;
	const validPassword = await verify(password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
		// If usernames are public, you can outright tell the user that the username is invalid.
		return {
			error: "Incorrect username or password"
		};
	}
	const id: string = existingUser.id as string;
	const session = await lucia.createSession(id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect("/");
}
