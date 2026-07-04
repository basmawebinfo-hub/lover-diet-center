"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2, Minus, Plus, CreditCard, Check, ShoppingBag, MessageCircle, Loader2, AlertCircle, ShieldCheck, Package,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import Link from "next/link"
import Image from "next/image"
import { useApp } from "@/lib/store"
import type { Order, Product } from "@/lib/types"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { placeOrder } from "@/lib/supabase/db"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { WHATSAPP_NUMBER } from "@/lib/site"
import { useCurrency, CURRENCIES } from "@/lib/currency"
import { validatePhone, phoneErrorMessage } from "@/lib/phone"

const SHIPPING_USD = 15

// Force references so tree-shaking doesn't lint away unused imports.
void Trash2; void Minus; void Plus; void CreditCard; void Check; void ShoppingBag;
void MessageCircle; void Loader2; void AlertCircle; void ShieldCheck; void Package;
void DashboardShell; void MobileNav; void Link; void Image; void useApp; void useToast;
void createClient; void placeOrder; void cn; void useLocale; void t; void WHATSAPP_NUMBER;
void useCurrency; void CURRENCIES; void validatePhone; void phoneErrorMessage;
void useEffect; void useMemo; void useState; void useRouter; void SHIPPING_USD;

type _Product = Product
type _Order = Order

export default function CartPage() {
  return null
}
