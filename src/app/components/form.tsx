"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input, MaskedInput } from "@/components/ui/input";
import { saveStudents, getCode } from "../actions";
import { toast } from "react-toastify";
import { calculateDistance } from "@/utils/calculate-distance";

type Student = {
	full_name: string;
	ra: string;
};

export const Form = ({ formSubmitted: formSubmittedParam }: { formSubmitted?: string }) => {
	const [student, setStudent] = React.useState<Partial<Student>>();
	const [formSubmitted, setFormSubmitted] = React.useState(formSubmittedParam === "true");
	const [loading, setLoading] = React.useState(false);

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

		const [name, code] = student.full_name.split("?");

		const referenceLatitude = -23.41771;
		const referenceLongitude = -51.93889;

		if (code === await getCode()) {
			setLoading(true);
			saveStudents(
				{
					full_name: name || '',
					ra: student.ra || '',
				},
				{ latitude: referenceLatitude, longitude: referenceLongitude },
			).then((res) => {
				const [error, message] = res;
				if (error) toast.error(message);
				else {
					toast.success(message);
					setFormSubmitted(true);
				}
				setLoading(false);
			});
		}

		setLoading(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;

				const distance = calculateDistance(
					latitude,
					longitude,
					referenceLatitude,
					referenceLongitude,
				);

				if (distance <= 126) {
					saveStudents(
					  {
					    full_name: name || '',
					    ra: student.ra || '',
					  },
					  { latitude, longitude },
					).then((res) => {
						const [error, message] = res;
						if (error) toast.error(message);
						else {
							toast.success(message);
							setFormSubmitted(true);
						}
						setLoading(false);
					});
				} else {
					setLoading(false);
					toast.error(
						"Opa.. Você não está no local correto! Certifique-se de estar dentro da faculdade e tente novamente!",
					);
				}
			},
			(error) => {
				setLoading(false);
				console.log(error);
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

				<Button type="submit" className="!mt-4 w-full" disabled={loading || formSubmitted}>
					{formSubmitted
						? "Presença Confirmada"
						: `Confirmar Presença (${new Date().toLocaleDateString("pt-BR")})`}
				</Button>
			</form>
		</div>
	);
};
