"use server";

import { prisma } from "@/services/prisma";
import { calculateDistance } from "@/utils/calculate-distance";
import { cookies } from "next/headers";

interface Student {
  full_name: string;
  ra: string;
}

export async function getAllStudents(): Promise<
  { id: string; students: (Student & { date: Date })[] }[]
> {
  return await prisma.leftEarlyStudent
    .findMany({
      include: { student: true },
    })
    .then((res) => {
      return res.reduce((acc, item) => {
        const date = new Date(item.date).toLocaleDateString("pt-BR");
        if (!acc[date]) {
          acc[date] = { id: date, students: [] };
        }
        acc[date].students.push({
          full_name: item.student.name,
          ra: item.student.ra,
          date: item.date,
        });
        return acc;
      }, {} as Record<string, { id: string; students: (Student & { date: Date })[] }>);
    })
    .then((grouped) => Object.values(grouped)) // Converte o objeto em um array
    .catch(() => {
      return [];
    });
}

export async function saveStudents(
  student: Student,
  { latitude, longitude }: { latitude: number; longitude: number }
): Promise<[boolean, string]> {
  const now = new Date();
  const hour = now.getUTCHours() - 3;
	const minutes = now.getUTCMinutes();
	const time = hour * 60 + minutes;

	/* const firstTime = time >= 21 * 60 + 30 && time <= 22 * 60;
	const secondTime = time >= 22 * 60 + 10 && time <= 22 * 60 + 40; */
  /* const third = time >= 22 * 60 + 30 && time <= 22 * 60 + 40;

	if (!third) {
		return [
			true,
			"Opa.. O serviço não está disponível no momento por conta do horário! Certifique-se de que agora seja entre 21:30 e 22:40!",
		];
	} */

  const currentYear = new Date().getFullYear();
  const raYear = Number.parseInt(
    student.ra.split("-")[1] || currentYear.toString()
  );

  if (raYear < 2000 || raYear > currentYear) {
    return [true, "Os últimos 4 dígitos não conferem"];
  }

  const referenceLatitude = -23.41771;
  const referenceLongitude = -51.93889;

  const distance = calculateDistance(
    latitude,
    longitude,
    referenceLatitude,
    referenceLongitude
  );

  /* if (distance > 126) {
    return [
      true,
      "Você é espertinho ein. Tá tentando burlar o sistema, mas não vai rolar.",
    ];
  } */

  const existingStudent = await prisma.leftEarlyStudent.findFirst({
    where: { student: { ra: student.ra } },
  });

  if (existingStudent) {
    cookies().set("FORM_SUBMITTED", "true");
    return [
      false,
      "Você já preencheu esse form! Se tu acha que não fala com o Brogio.",
    ];
  }

  cookies().set("FORM_SUBMITTED", "true");
  return await prisma.leftEarlyStudent
    .create({
      data: {
        date: now,
        student: {
          connectOrCreate: {
            where: { ra: student.ra },
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
        string
      ];
    });
}
