import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="w-full flex justify-center mt-4">
            <ul className="flex gap-4">
                <li className="font-semibold hover:underline text-zinc-800">
                    <Link 
                        href="/"
                    >
                        Home
                    </Link>
                </li>
                <li className="font-semibold hover:underline text-zinc-800">
                    <Link
                        href="/bookings"
                    >
                        My bookings
                    </Link>
                </li>
            </ul>
        </nav>
    )
}