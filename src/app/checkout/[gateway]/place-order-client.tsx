"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlaceOrderClient(props: {
  storefrontId: string;
  productId: string;
  currency: string;
  priceCents: number;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const emailTrim = email.trim();
      if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        setMsg("Enter a valid email (required for checkout).");
        setBusy(false);
        return;
      }
      const res = await fetch("/api/storefront/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storefrontId: props.storefrontId,
          productId: props.productId,
          quantity,
          email: emailTrim,
          recipient: {
            name,
            address1,
            address2: address2 || undefined,
            city,
            state_code: stateCode || undefined,
            country_code: countryCode,
            zip,
            phone: phone || undefined,
          },
        }),
      });
      const json = (await res.json()) as { error?: string; printful?: { id?: number | string } };
      if (!res.ok) {
        setMsg(json?.error ?? "Order failed.");
        return;
      }
      setMsg(`Order placed in Printful (id ${json?.printful?.id}). Check Dashboard → orders.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Order failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-zinc-200">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Address 1</Label>
          <Input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="123 Main St" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Address 2 (optional)</Label>
          <Input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Apt 4B" />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin" />
        </div>
        <div className="space-y-2">
          <Label>State code (optional)</Label>
          <Input value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder="TX" />
        </div>
        <div className="space-y-2">
          <Label>ZIP</Label>
          <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="78701" />
        </div>
        <div className="space-y-2">
          <Label>Country code</Label>
          <Input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} placeholder="US" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Phone (optional)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            value={String(quantity)}
            onChange={(e) => setQuantity(Number(e.target.value || "1"))}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void submit()} disabled={busy}>
          {busy ? "Placing order…" : "Place real Printful order"}
        </Button>
        {msg ? <p className="text-xs text-zinc-400">{msg}</p> : null}
      </div>
    </div>
  );
}

