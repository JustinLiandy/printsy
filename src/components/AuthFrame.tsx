"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AuthFrame({
  title,
  description,
  footer,
  children,
  className,
}: {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center p-6">
      <Card className={cn("w-full shadow-card border-slate-200 bg-white", className)}>
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-slate-600">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? <CardFooter className="justify-between">{footer}</CardFooter> : null}
      </Card>
    </div>
  );
}

// Optional named export if you really want to import { AuthFrame }
export { AuthFrame as NamedAuthFrame };