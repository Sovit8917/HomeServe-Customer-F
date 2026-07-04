"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import OtpInput from "@/components/ui/OtpInput";
import toast from "react-hot-toast";

function OtpForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") || "";
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phone, otp);
      const { token, worker, isNew } = res.data.data;
      setAuth(worker, token);
      router.push(isNew ? "/auth/complete-profile" : "/dashboard");
      toast.success("Logged in successfully!");
    } catch {
      toast.error("Incorrect OTP. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }, [otp, phone, setAuth, router]);

  useEffect(() => {
    if (otp.length === 6) handleVerify();
  }, [otp, handleVerify]);

  const resendOtp = async () => {
    try {
      await authService.sendOtp(phone);
      setCountdown(30);
      toast.success("OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} className="text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Verify your number
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            OTP sent to{" "}
            <span className="font-semibold text-gray-700">{phone}</span>
          </p>

          <OtpInput length={6} value={otp} onChange={setOtp} />

          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full mt-7"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="mt-5 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend in{" "}
                <span className="font-semibold text-blue-600">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={resendOtp}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
