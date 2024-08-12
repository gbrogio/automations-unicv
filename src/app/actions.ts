"use server";

import { prisma } from "@/services/prisma";

interface Student {
	full_name: string;
	ra: string;
}

export async function getAllStudents(): Promise<
	{ id: string; students: Student[] }[]
> {
	const studentsGroupedByDate = await prisma.faltas.findMany({
		select: {
			id: true,
			students: true,
		},
	});

	return studentsGroupedByDate.map((group) => ({
		id: group.id,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		students: (group as any).students.map((student: any) => ({
			full_name: student.name,
			ra: student.ra,
		})),
	}));
}

export async function saveStudents(
	student: Student,
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
		.catch(
			(e) =>{
				console.log(e)
				return[true, "Chama o Brogio pq tu fez merda e bugou tudo!"] as [
					boolean,
					string,
				]},
		);
}
