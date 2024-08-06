import Link from "next/link";
import CreateUser from "@/app/admin/create-user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/lib/form";
import type { ActionResult } from "@/lib/form";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function Page() {
	const { user } = await validateRequest();
	if (!user) {
		return redirect("/login");
	}
	if (user?.username != "Chinna") {
		return redirect("/");
	}
	return (
		<div className="h-full flex flex-col justify-center items-center">
			<Tabs defaultValue="account" className="w-[400px] h-[350px]">
			<TabsList>
				<TabsTrigger value="account">Create User</TabsTrigger>
				<TabsTrigger value="password">Users</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<CreateUser></CreateUser>
			</TabsContent>
			<TabsContent value="password">Change your password here.</TabsContent>
			</Tabs>
			<Form action={logout}>
				<Button className="w-full">Sign out</Button>
			</Form>
		</div>
	)
}

async function logout(): Promise<ActionResult> {
	"use server";
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect("/login");
}