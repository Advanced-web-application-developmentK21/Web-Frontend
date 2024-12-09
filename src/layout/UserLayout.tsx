import Header from "../components/header";
import PageWrapper from "../components/pagewrapper";
import Sidebar from "../components/sidebar";
import { SIDENAV_ITEMS } from "../menu_constants";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Sidebar menuItems={SIDENAV_ITEMS}/>
            <div className="flex flex-col h-full w-full">
                <Header />
                <PageWrapper children={children} />
            </div>
        </>
    )
}