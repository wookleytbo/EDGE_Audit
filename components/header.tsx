"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-helpers"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <FileText className="h-6 w-6 text-primary" />
          FieldForm
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/templates" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Templates
          </Link>
          <Link href="/builder" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Form Builder
          </Link>
          <Link
            href="/submissions"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Submissions
          </Link>
          <Link href="/analytics" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Analytics
          </Link>
          <Link href="/scheduling" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Scheduling
          </Link>
          <Link href="/work-orders" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Work Orders
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
