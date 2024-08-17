"use client";
import { year, faculty } from "@/lib/details";
import { useState } from "react";

export default function Select() {
	const [value, setValue] = useState(year[0]);
	const [facultyList, setFacultyList] = useState(faculty[value]);
	const [facultyValue, setFacultyValue] = useState(faculty[value][0]);
	const handleValue = (event:any) => {
		setValue(event.target.value);
		setFacultyList(faculty[event.target.value]);
	};
    return (
        <div>
			<form className="flex lg:flex-row flex-col gap-4">
				<label className="text-2xl">Faculty Details</label>
				<select value={value} onChange={handleValue}>
				{year.map((detail) => (
					<option key={detail} value={detail}>
						{detail}
					</option>
				))}
				</select>
				<select value={facultyValue} onChange={(event) => setFacultyValue(event.target.value)}>
				{facultyList.map((detail) => (
					<option key={detail} value={detail}>
						{detail}
					</option>
				))}
				</select>
			</form>
		</div>
    );
}