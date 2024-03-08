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
async function loadQuery({ collectionID, order, conditions = [], loadAfter }) {
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
  const [certificate, setCertificate] = useState(null);

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

  useEffect(() => {
    if (searchParams.has("id")) {
      getDoc(doc(db, "records", searchParams.get("id"))).then((res) => {
        if (res.exists()) {
          setCertificate(res);
          setShowDialog(true);
        }
      });
    } else {
      setCertificate(null);
      setShowDialog(false);
    }
  }, [searchParams]);

  const handleLoadMore = () => {
    setTableQuerying(true);
    loadQuery({
      collectionID: "records",
      order: orderBy("created", "desc"),
      loadAfter: startAfter(tableQuery[tableQuery.length - 1]),
    }).then((result) => {
      setQuery([...tableQuery, ...result.docs]);
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
      <View open={showDialog} set={setShowDialog} certificate={certificate} />
    </>
  );
}

const CertificateRow = memo(({ data, ...props }) => {
  const init = useRef(false);
  const router = useRouter();
  useEffect(() => {
    if (!init.current) {
    }
    init.current = true;
  }, []);
  return (
    <TableRow
      onClick={() => {
        router.push("/dashboard?id=" + data.id);
      }}
      className="hover:cursor-pointer"
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

import Certificate from "@/components/dashboard/certificate";
const View = ({ certificate, children, set, ...props }) => {
  // use employee object to display

  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (certificate) {
      setData({
        ...certificate.data(),
        id: certificate.id,
      });
    }
  }, [certificate]);

  // loading state

  const handleEdit = () => {
    setIsEdit(true);
  };
  const handleCancel = () => {
    setIsEdit(false);
    if (certificate) {
      setData({
        ...certificate?.data(),
      });
    }
  };
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      handleCancel();
      router.push("/dashboard");
    }
  };

  const handleSave = (e) => {
    // setdoc
  };

  const handleDelete = async (e) => {
    // if (!employee) return;
    // auth.currentUser
    //   .getIdToken(true)
    //   .then(function (idToken) {
    //     return fetch("/api/delete-employee", {
    //       method: "POST",
    //       body: JSON.stringify({ token: idToken, employeeID: employee.id }),
    //     });
    //   })
    //   .then((response) => {
    //     router.push("/dashboard/employee");
    //   })
    //   .catch(function (error) {
    //     // Handle error
    //     console.error("failed to delete");
    //     console.error(error);
    //   });
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl max-h-screen bg-slate-100">
        <DialogHeader>
          <DialogTitle>Certificate</DialogTitle>
        </DialogHeader>
        <ScrollArea
          type="auto"
          className="max-h-[70vh] p-4 bg-white grid grid-cols-1 place-content-center"
        >
          <div className="h-full w-full grid place-content-center">
            <Certificate data={data} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="grid gap-4 grid-cols-[1fr_min-content] mt-4">
          {isEdit ? (
            <div className="col-start-2 flex flex-row gap-2">
              <Button onClick={handleCancel} type="">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-400 hover:bg-green-700"
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="col-start-2 flex flex-row gap-2">
              <Dialog>
                <DialogTrigger
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Delete
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      the certificate record.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={handleDelete} variant="destructive">
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={handleEdit} type="">
                Edit
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Records;
