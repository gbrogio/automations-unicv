"use server";

import { prisma } from "@/services/prisma";

interface Student {
	full_name: string;
	ra: string;
}

export async function getStudents(): Promise<Student[]> {
	const today = new Date().toLocaleDateString("pt-BR");

	return await prisma.faltas
		.findUnique({
			where: { id: today },
			select: { students: true },
		})
		.then((res) => res?.students as unknown as Student[] || [])
		.catch(() => {
			return [];
		});
}

export async function getAllStudents(): Promise<{ id: string, students: Student[] }[]> {
	return await prisma.faltas
		.findMany()
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		.then((res) => res as any || [])
		.catch(() => {
			return [];
		});
}

export async function saveStudents(
	student: Student,
	students: Student[],
): Promise<[boolean, string]> {
	const today = new Date().toLocaleDateString("pt-BR");
	const studentsUpdate = students.some(
		(s: Student) => s.ra.slice(0, 6) === student.ra.slice(0, 6),
	)
		? undefined
		: [...students, student];

	if (!studentsUpdate)
		return [
			false,
			"Você já preencheu esse form! Se tu acha que não fala com o Brogio.",
		];

	return await prisma.faltas
		.upsert({
			where: { id: today },
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			update: { students: { set: studentsUpdate as any } },
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			create: { id: today, students: studentsUpdate as any },
		})
		.then(() => [false, "Que milagre, deu certo!"] as [boolean, string])
		.catch(
			() =>
				[true, "Chama o Brogio pq tu fez merda e bugou tudo!"] as [
					boolean,
					string,
				],
		);
}
