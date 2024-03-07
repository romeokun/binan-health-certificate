"use client";
import React, { useContext, useEffect, useRef, useState, memo } from "react";
import { AuthContext } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { RotateCcw, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  addDoc,
  Timestamp,
  serverTimestamp,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { auth } from "@/config/firebase";

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

const PAGELIMIT = 25;
function handleQuery(array = []) {
  // return array.filter(x => x !== null)
  const x = array.filter((x) => x);
  return x;
}
async function loadQuery({ collectionID, order, conditions =[], loadAfter }) {
  const q = query(
    collection(db, collectionID),
    ...handleQuery([order, ...conditions, loadAfter]),
    limit(PAGELIMIT)
  );

  return getDocs(q);
}

function Records() {
  const { currentUser } = useContext(AuthContext);
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(searchParams.has("id"));
  const [tableQuery, setQuery] = useState([]);

  const [tableQuerying, setTableQuerying] = useState(false);

  function getCertificatesQuery({ conditions = [] }) {
    setTableQuerying(true);
    loadQuery({
      collectionID: "records",
      order: orderBy("created", "desc"),
      conditions,
    }).then((result) => {
      setQuery(result.docs);
      setTableQuerying(false);
    });
  }

  const initialized = useRef(false);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }

    if (!initialized.current) {
      try {
        getCertificatesQuery({
          setSnap: setQuery,
          setLoading: setTableQuerying,
        });
      } catch (error) {
        console.error(error);
      }

      initialized.current = true;
    }
  }, []);

  const handleLoadMore = () => {
    setTableQuerying(true);
    loadQuery({
      collectionID: "records",
      order: orderBy("created", "desc"),
      loadAfter: startAfter(tableQuery[tableQuery.length -1]),
    }).then((result) => {
      setQuery([ ...tableQuery, ...result.docs]);
      setTableQuerying(false);
    });
  };

  return (
    <>
      <div className="grid mt-2 grid-cols-[1fr_min-content]">
        <div></div>
        <div className="grid grid-cols-[min-content_min-content_min-content]">
          <Button className="mx-1">Filter</Button>
          <Button className="mx-1">Print</Button>
          <Button className="mx-1" variant="outline">
            <RotateCcw />
          </Button>
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
      <div className="mt-4">
        <Table>
          <TableCaption>
            {!tableQuery && !tableQuerying && "Nothing to Show"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Place of Work</TableHead>
              <TableHead className="">Occupation</TableHead>
              <TableHead className="text-center">Date Issued</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!tableQuerying &&
              tableQuery?.map((data) => {
                return <CertificateRow key={data.id} data={data} />;
              })}
          </TableBody>
        </Table>
        <div className="grid place-items-center">
          {tableQuerying ? (
            "loading"
          ) : (
            <Button
              onClick={handleLoadMore}
              disabled={tableQuerying}
              variant="outline"
            >
              Load More
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

const CertificateRow = memo(({ data, ...props }) => {
  const init = useRef(false);
  useEffect(() => {
    if (!init.current) {
    }
    init.current = true;
  }, []);
  return (
    <TableRow
      onClick={() => {
        console.log("clicked");
      }}
    >
      <TableCell className="font-medium">{data.data().employeeName}</TableCell>
      <TableCell>{data.data().company}</TableCell>
      <TableCell className="">{data.data().occupation}</TableCell>
      <TableCell className="text-center">{data.data().dateIssued}</TableCell>
    </TableRow>
  );
});

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

export default Records;
