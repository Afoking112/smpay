import type { Metadata } from "next";
import LandingExperience from "@/component/LandingExperience";

export default function Home() {
    return <LandingExperience />;
}

export const metadata: Metadata = {
    title: "SM PAY | 3D Payment Command Center",
    description: "Fund your wallet, buy airtime and data, manage tracked requests, and keep payment visibility inside one polished SM PAY experience.",
};
