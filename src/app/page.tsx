import { Form } from "@/lib/form";
import { Button } from "@/components/ui/button";
import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ActionResult } from "@/lib/form";
import Select from "./select";


export default async function Page() {
	const { user } = await validateRequest();
	if (!user) {
		return redirect("/login");
	}if (user?.username == "admin") {
		return redirect("/admin");
	}
	return (
		<div className="h-full">
			<div className="absolute right-0 top-0">
				<Form action={logout}>
					<Button className="w-full">Sign out</Button>
				</Form>
			</div>
			<div className="flex justify-center items-center h-full">
				<Select/>
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
