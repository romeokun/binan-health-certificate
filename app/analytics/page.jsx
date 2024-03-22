"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "@/components/auth-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chart } from "react-google-charts";
import { baranggays, nationalities } from "@/config/local";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { months } from "@/config/local";

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
  const [analyticsYear, setAnalyticsYear] = useState(currentYear.toString());
  const { currentUser } = useContext(AuthContext);

  const [dataAvailable, setDataAvailable] = useState(false);
  const [totalsData, setTotalsData] = useState({
    certificates: 0,
    employees: 0,
  });
  const [baranggayData, setBaranggayData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [natinalitiesData, setNationalitiesData] = useState({});

  const getData = () => {
    getDoc(doc(db, "analytics", analyticsYear))
      .then((res) => {
        if (!res.exists()) {
          throw new Error("does not exist");
        } else {
          setTotalsData({
            certificates: res.data().numberOfCertificates,
            employees: res.data().numberOfNewEmployee,
          });

          setMonthlyData([
            ["Months", "Certificates"],
            ...months.map((x) => {
              const count = res.data().byMonth[x.value]
                ? res.data().byMonth[x.value]
                : 0;
              return [x.text, count];
            }),
          ]);

          setBaranggayData([
            ["Baranggays", "Employees"],
            ...baranggays.map((x) => {
              const count = res.data().baranggay[x]
                ? res.data().baranggay[x]
                : 0;
              return [x, count];
            }),
          ]);

          setNationalitiesData([
            ["Nationalities", "count"],
            ...nationalities.map((x) => {
              const count = res.data().nationality[x.value]
                ? res.data().nationality[x.value]
                : 0;
              return [x.value, count];
            }),
          ]);

          setDataAvailable(true);
        }
      })
      .catch((e) => {
        console.error(e);
        setDataAvailable(false);
      });
  };
  const initialized = useRef(false);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }

    if (!initialized.current) {


      initialized.current = true;
    }
  }, []);

  useEffect(()=>{
    getData();
  },[analyticsYear])

  return (
    <div className=" p-4">
      <h1 className="pl-4 pb-2 text-2xl font-semibold">Analytics</h1>
      <SelectOption
        title="Select Year"
        data={reversedYears}
        className={"w-[20ch] m-1"}
        value={analyticsYear}
        onValueChange={(value) => {
          setAnalyticsYear(value);
          getData();
        }}
      />{" "}
      <br />
      {dataAvailable ? (
        <>
          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] place-items-center">
            <div className="shadow w-full text-lg p-4 border text-center bg-accent">
              <span className="text-2xl font-bold text-blue-950">
                {totalsData.certificates}
              </span>
              <br />
              <span className="">TOTAL 2024 CERTIFICATE</span>
            </div>
            <div className="shadow w-full text-lg p-4 border text-center bg-accent">
              <span className="text-2xl font-bold text-blue-950">
                {totalsData.employees}
              </span>
              <br />
              <span className="">NEW 2024 EMPLOYEE</span>
            </div>
          </div>
          <br />
          <div className="w-full border bg-accent p-4 mb-8 overflow-x-auto">
            <div className="text-xl font-semibold pb-2">Baranggays</div>
            <Chart
              chartType="ColumnChart"
              data={baranggayData}
              height="400px"
              // width="1000px"
            />
          </div>
          <div className="w-full border bg-accent p-4 my-8 overflow-x-auto">
            <div className="text-xl font-semibold pb-2">Monthly chart</div>
            <Chart
              chartType="ColumnChart"
              data={monthlyData}
              height="400px"
              // width="1000px"
            />
          </div>
          <div className="w-full border bg-accent p-4 my-8 overflow-x-auto">
            <div className="text-xl font-semibold pb-2">Nationalities</div>
            <Chart
              chartType="PieChart"
              data={natinalitiesData}
              options={{ sliceVisibilityThreshold: 1 / 196 }}
              height="400px"
              // width="1000px"
            />
          </div>
        </>
      ) : (
        <>not available</>
      )}
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
