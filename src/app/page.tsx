import { lucia, validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
	const { user } = await validateRequest();
	if (!user) {
		return redirect("/login");
	}if (user?.username == "Chinna") {
		return redirect("/admin");
	}
	return (
		<div className="flex items-center justify-center h-full">
			<div className="p-6 bg-muted border-primary border-4">
				<h1>Hi, {user.username}!</h1>
				<p>Your user ID is {user.id}.</p>
				<Form action={logout}>
					<Button className="w-full">Sign out</Button>
				</Form>
			</div>
		</div>
	);
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
