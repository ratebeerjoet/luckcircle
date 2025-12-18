import LoginForm from "./login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-950">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[30%] w-[60%] h-[60%] bg-blue-900/10 blur-[130px] rounded-full" />
            </div>
            <LoginForm />
        </div>
    );
}
