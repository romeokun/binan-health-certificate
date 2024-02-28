"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  { text: "Select Month", value: 0 },
  { text: "January", value: 1 },
  { text: "February", value: 2 },
  { text: "March", value: 3 },
  { text: "April", value: 4 },
  { text: "May", value: 5 },
  { text: "June", value: 6 },
  { text: "July", value: 7 },
  { text: "August", value: 8 },
  { text: "September", value: 9 },
  { text: "October", value: 10 },
  { text: "November", value: 11 },
  { text: "December", value: 12 },
];
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const years = [];
let tmp = 2020;
while (tmp <= currentYear) {
  years.push({ value: tmp, text: tmp });
  tmp++;
}
years.push({ value: 0, text: "Year" });
const reversedYears = years.reverse();

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <div className="grid mt-2 grid-cols-[1fr_min-content]">
        <div></div>
        <div className="grid grid-cols-[min-content_min-content_min-content]">
          <Button className="mx-1" >Filter</Button>
          <Button className="mx-1">Renew</Button>
          <Button className="mx-1" variant="outline"><RotateCcw /></Button>
        </div>
      </div>
      {/* <div className="grid mt-2 grid-cols-[min-content_min-content_min-content_1fr]">
        <SelectOption
          className="w-[150px] mx-1"
          title="Select Month"
          data={months}
        />
        <SelectOption
          className="w-[80px] mx-1"
          title="Year"
          data={reversedYears}
        />
        <Input className="w-[40ch]" type="text" placeholder="Company Name" />
        <div className="grid place-items-center">
          <Button>Search</Button>
        </div>
      </div> */}
      Month Year Company Renew refresh
      <div>table</div>
    </>
  );
}

const SelectOption = ({ title, data, className }) => {
  return (
    <Select>
      <SelectTrigger className={className}>
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {data?.map((x) => {
          return (
            <SelectItem key={x.value} value={x.value}>
              {" "}
              {x.text}{" "}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default Dashboard;
