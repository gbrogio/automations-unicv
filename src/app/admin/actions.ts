'use server'

import { redirect } from "next/navigation";
const EMAIL = process.env.LOGIN_EMAIL;
const PASSWORD = process.env.LOGIN_PASSWORD;

export async function loginAction ({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	if (email === EMAIL && password === PASSWORD) {
		// Lógica de autenticação bem-sucedida
		redirect('/admin/dashboard');
		return '';
	}

	return 'Email ou senha incorretos';
};