"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chart } from "react-google-charts";
import { baranggays } from "@/config/local";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const years = [];
let tmp = 2020;
while (tmp <= currentYear) {
  years.push({ value: tmp.toString(), text: tmp.toString() });
  tmp++;
}
const reversedYears = years.reverse();

function Analytics() {
  const baranggayData = [
    ["Baranggays", "count"],
    ...baranggays.map((x) => {
      return [x, 10];
    }),
  ];

  return (
    <div className=" p-4">
      <h1 className="pl-4 pb-2 text-2xl font-semibold">Analytics</h1>
      <SelectOption
        title="Select Year"
        data={reversedYears}
        className={"w-[20ch] m-1"}
        value={currentDate.getFullYear().toString()}
      />{" "}
      <br />
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] place-items-center">
        <div className="shadow w-full text-lg p-4 border text-center bg-accent">
          <span className="text-2xl font-bold text-blue-950">100 </span>
          <br />
          <span className="">TOTAL 2024 CERTIFICATE</span>
        </div>
        <div className="shadow w-full text-lg p-4 border text-center bg-accent">
          <span className="text-2xl font-bold text-blue-950">100 </span>
          <br />
          <span className="">NEW 2024 EMPLOYEE</span>
        </div>
      </div>
      <br />
      <div className="w-full border bg-accent p-4 my-8 overflow-x-auto">
        <div className="text-xl font-semibold pb-2">Baranggays</div>
        <Chart
            chartType="ColumnChart"
            data={baranggayData}
            height="400px"
            width="1000px"
          />
      </div>
      <div className="w-full border bg-accent p-4 my-8 overflow-x-auto">
        <div className="text-xl font-semibold pb-2">Monthly chart</div>
        <Chart
            chartType="ColumnChart"
            data={baranggayData}
            height="400px"
            width="1000px"
          />
      </div>
       nationality chart
    </div>
  );
}

const SelectOption = ({ title, data, className, onValueChange, value }) => {
  return (
    <Select onValueChange={onValueChange} value={value}>
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

export default Analytics;
