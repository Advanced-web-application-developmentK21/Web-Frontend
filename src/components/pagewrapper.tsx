"use client";
import classNames from "classnames";
import { ReactNode } from "react";
import { useSideBarToggle } from "../hooks/use-sidebar-toggle";

//bọc nội dung trang
export default function PageWrapper({ children }: { children: ReactNode }) {
  const { toggleCollapse } = useSideBarToggle();
  const bodyStyle = classNames(
    "bg-background flex flex-col p-4 min-h-screen mt-3 mr-4",
    {
      ["pl-[18.4rem]"]: !toggleCollapse,
      ["pl-[9.7rem]"]: toggleCollapse,
    }
  );

  return <div className={bodyStyle}>{children}</div>;
}
