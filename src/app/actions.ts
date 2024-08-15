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
		.then((res) => (res?.students as unknown as Student[]) || [])
		.catch(() => {
			return [];
		});
}

export async function getAllStudents(): Promise<
	{ id: string; students: Student[] }[]
> {
	return await prisma.faltas
		.findMany({
			include: { students: true },
		})
		.then((res) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return ((res as any) || []).map((day: any) => ({
				id: day.id,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				students: day.students.map((student: any) => ({
					full_name: student.name,
					ra: student.ra,
				})),
			}));
		})
		.catch(() => {
			return [];
		});
}

export async function saveStudents(
	student: Student,
	location: { latitude: number; longitude: number },
): Promise<[boolean, string]> {
	const today = new Date().toLocaleDateString("pt-BR");

	const existingStudent = await prisma.faltas.findFirst({
		where: {
			id: today,
			students: {
				some: {
					ra: student.ra,
					name: student.full_name.toUpperCase(),
				},
			},
		},
	});

	if (existingStudent) {
		return [
			false,
			"Você já preencheu esse form! Se tu acha que não fala com o Brogio.",
		];
	}

	return await prisma.faltas
		.upsert({
			where: {
				id: today,
			},
			update: {
				students: {
					connectOrCreate: {
						where: {
							name: student.full_name.toUpperCase(),
							ra: student.ra,
						},
						create: {
							name: student.full_name.toUpperCase(),
							ra: student.ra,
						},
					},
				},
			},
			create: {
				id: today,
				students: {
					connectOrCreate: {
						where: {
							name: student.full_name.toUpperCase(),
							ra: student.ra,
						},
						create: {
							name: student.full_name.toUpperCase(),
							ra: student.ra,
						},
					},
				},
			},
		})
		.then(() => [false, "Que milagre, deu certo!"] as [boolean, string])
		.catch((e) => {
			console.log(e);
			return [true, "Chama o Brogio pq tu fez merda e bugou tudo!"] as [
				boolean,
				string,
			];
		});
}
