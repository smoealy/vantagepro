import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
            <SignUp
                appearance={{
                    elements: {
                        card: "bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-3xl",
                        headerTitle: "text-white font-black uppercase tracking-tighter",
                        headerSubtitle: "text-white/40",
                        socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all",
                        socialButtonsBlockButtonText: "text-white font-bold",
                        dividerLine: "bg-white/10",
                        dividerText: "text-white/20",
                        formFieldLabel: "text-white/60 font-bold",
                        formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl focus:border-purple-500/30 transition-all",
                        formButtonPrimary: "bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] rounded-xl py-3 shadow-xl shadow-white/5 transition-all",
                        footerActionText: "text-white/40",
                        footerActionLink: "text-purple-400 font-bold hover:text-purple-300 transition-colors"
                    }
                }}
            />
        </div>
    );
}
