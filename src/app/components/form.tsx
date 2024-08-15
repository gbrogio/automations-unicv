"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input, MaskedInput } from "@/components/ui/input";
import { saveStudents } from "../actions";
import { toast } from "react-toastify";

type Student = {
	full_name: string;
	ra: string;
};

function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const R = 6371e3; // Raio da Terra em metros
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Distância em metros
	return distance;
}

export const Form = () => {
	const [student, setStudent] = React.useState<Partial<Student>>();
	const [formSubmitted, setFormSubmitted] = React.useState(false);
	const [location, setLocation] = React.useState({
		latitude: null,
		longitude: null,
	});

	React.useEffect(() => {
		try {
			const storedStudent = JSON.parse(localStorage.getItem("student") || "");
			if (storedStudent) {
				setStudent({
					full_name: storedStudent.full_name || "",
					ra: storedStudent.ra || "",
				});
			}
		} catch {
			localStorage.removeItem("student");
		}

		const formSubmittedCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("FORM_SUBMITTED="));

		if (formSubmittedCookie) {
			const formSubmittedValue = formSubmittedCookie.split("=")[1];
			if (formSubmittedValue === "true") {
				setFormSubmitted(true);
			}
		}
	}, []);

	React.useEffect(() => {
		localStorage.setItem("student", JSON.stringify(student));
	}, [student]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!navigator.geolocation) {
			toast.error(
				"Geolocalização não é suportada pelo seu navegador. Chama o Brogio!",
			);
			return;
		}
		if (!student || !student.full_name?.length || !student.ra?.length) return;

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				// const referenceLatitude = -23.417938918087827;
				// const referenceLongitude = -51.93911424044318;
        
				const referenceLatitude = -23.006069366828115;
				const referenceLongitude = -51.95139369768306;

				// Função para calcular a distância entre dois pontos geográficos usando a fórmula de Haversine

				const distance = calculateDistance(
					latitude,
					longitude,
					referenceLatitude,
					referenceLongitude,
				);

				if (distance <= 500) {
					const [error, message] = await saveStudents(
					  {
					    full_name: student.full_name || '',
					    ra: student.ra || '',
					  },
					  { latitude, longitude },
					);
					if (error) toast.error(message);
					else {
						toast.success(message);
						setFormSubmitted(true);
					}
				} else {
					toast.error(
						"Você é espertinho ein. Tá tentando burlar o sistema, mas não vai rolar.",
					);
				}
			},
			(error) => {
				console.error(error);
				toast.error("Não foi possível obter a localização.");
			},
		);
	};

	return (
		<div className="text-center px-4 max-w-md mx-auto my-auto space-y-2">
			<h1 className="text-xl font-bold">Indo embora mais cedo?</h1>
			<p className="text-muted-foreground text-sm">
				Preencha esse formulário para que possamos registrar a sua presença e
				para que você não seja prejudicado!
			</p>
			<Separator className="!my-4 w-1/2 mx-auto" />
			<form onSubmit={handleSubmit} className="text-left space-y-2">
				<div className="space-y-1">
					<Label htmlFor="name">Seu nome COMPLETO*:</Label>
					<Input
						id="name"
						placeholder="Joãozinho Gameplays"
						value={student?.full_name || ""}
						required
						onChange={(e) =>
							setStudent((prevStudent) => ({
								...prevStudent,
								full_name: e.target.value,
							}))
						}
						disabled={formSubmitted}
					/>
				</div>
				<div className="space-y-1">
					<Label htmlFor="ra">Seu nome registro acadêmico (RA)*:</Label>
					<MaskedInput
						id="ra"
						placeholder="000000-0000"
						mask="\dr}\dr}\dr}\dr}\dr}\dr}-'\dr}\dr}\dr}\dr}"
						showMask={false}
						required
						pattern="\d{6}-?\d{0,4}"
						value={student?.ra || ""}
						onChange={(e) => {
							const raValue = e.target.value;
							const currentYear = new Date().getFullYear();
							const raYear = Number.parseInt(
								raValue.split("-")[1] || currentYear.toString(),
							);

							if (raYear < 2000 || raYear > currentYear) {
								e.target.setCustomValidity("Os últimos 4 dígitos não conferem");
								e.target.reportValidity();
							} else {
								e.target.setCustomValidity("");
							}
							setStudent((prevStudent) => ({
								...prevStudent,
								ra: raValue,
							}));
						}}
						disabled={formSubmitted}
					/>
				</div>

				<Button type="submit" className="!mt-4 w-full" disabled={formSubmitted}>
					{formSubmitted
						? "Presença Confirmada"
						: `Confirmar Presença (${new Date().toLocaleDateString("pt-BR")})`}
				</Button>
			</form>
		</div>
	);
};
