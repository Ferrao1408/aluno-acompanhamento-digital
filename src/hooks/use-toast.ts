
import * as React from "react";
import { useToast as useShadcnToast } from "@/components/ui/toast";

// Re-export the toast APIs
export const useToast = useShadcnToast;
export const toast = useShadcnToast().toast;
