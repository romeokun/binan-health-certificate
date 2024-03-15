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
  setDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { auth } from "@/config/firebase";

const months = [
  { text: "January", value: "01" },
  { text: "February", value: "02" },
  { text: "March", value: "03" },
  { text: "April", value: "04" },
  { text: "May", value: "05" },
  { text: "June", value: "06" },
  { text: "July", value: "07" },
  { text: "August", value: "08" },
  { text: "September", value: "09" },
  { text: "October", value: "10" },
  { text: "November", value: "11" },
  { text: "December", value: "12" },
];
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const years = [];
let tmp = 2020;
while (tmp <= currentYear) {
  years.push({ value: tmp.toString(), text: tmp.toString() });
  tmp++;
}
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
  const [showDialog, setShowDialog] = useState(false);
  const [tableQuery, setQuery] = useState([]);
  const [tableQuerying, setTableQuerying] = useState(false);
  const endOfQuery = useRef(false);
  const [certificate, setCertificate] = useState(null);
  const [showFilter, setShowFilter] = useState(searchParams.has("filter"));

  const filter = (() => {
    switch (searchParams.get("filter")) {
      case "month":
        return [
          where("dateIssued.month", "==", searchParams.get("month")),
          where("dateIssued.year", "==", searchParams.get("year")),
        ];
      case "year":
        return [where("dateIssued.year", "==", searchParams.get("year"))];
      case "company":
        return [where("company", "==", searchParams.get("company"))];

      default:
        return [];
    }
  })();

  function getCertificatesQuery() {
    setTableQuerying(true);
    loadQuery({
      collectionID: "records",
      order: orderBy("created", "desc"),
      conditions: filter,
    }).then((result) => {
      setQuery(result.docs);
      setTableQuerying(false);
    });
  }

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    endOfQuery.current = false;
    setShowFilter(searchParams.has("filter"));
    getCertificatesQuery();
    if (tableQuery.length < PAGELIMIT) endOfQuery.current = true;
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
      if (result.docs.length <= 0) {
        endOfQuery.current = true;
      }
    });
  };

  return (
    <>
      <div className="grid mt-2 grid-cols-[1fr_min-content]">
        <div></div>
        <div className="grid grid-cols-[min-content_min-content_min-content]">
          <Button
            className="mx-1"
            onClick={() => {
              setShowFilter(!showFilter);
            }}
          >
            Filter
          </Button>
          <Button className="mx-1">Print</Button>
          <Button
            className="mx-1"
            variant="outline"
            onClick={getCertificatesQuery}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>
      <Filter hidden={showFilter} searchParams={searchParams} />
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
              disabled={tableQuerying || endOfQuery.current}
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
      <TableCell className="text-center">
        {data.data().dateIssued.year}
      </TableCell>
    </TableRow>
  );
});

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

import Certificate from "@/components/dashboard/certificate";
const View = ({ certificate, children, set, ...props }) => {
  // use employee object to display

  const { currentUser } = useContext(AuthContext);
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const currentDate = new Date();

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
    await runTransaction(db, async (transaction) => {
      const ref = doc(
        db,
        "analytics",
        data.dateIssued.year
      );
      const analytics = await transaction.get(ref);
      if (!analytics.exists()) {
        await setDoc(
          doc(db, "analytics", data.dateIssued.year),
          {
            numberOfCertificates: 0,
            baranggay: { [data.placeOfWork]: 0 },
            byMonth: { [data.dateIssued.month.toString().padStart(2, 0)]: 0 },
            nationality: { [data.nationality]: 0 },
          }
        );
      } else {
        const certificateCount = analytics.data().numberOfCertificates;
        const newCertificates =
          (certificateCount ? certificateCount : 0) - 1;

        const certificateCountByMonth =
          analytics.data().byMonth?.[
            (data.dateIssued.month).toString().padStart(2, 0)
          ];
        const newCertificateCountByMonth =
          (certificateCountByMonth ? certificateCountByMonth : 0) - 1;

        const baranggayCount =
          analytics.data().baranggay?.[data.placeOfWork];
        const updateCount = (baranggayCount ? baranggayCount : 0) - 1;

        const nationalityCount =
          analytics.data().nationality?.[data.nationality];
        const updateNationalityCount =
          (nationalityCount ? nationalityCount : 0) - 1;
        transaction.update(ref, {
          numberOfCertificates: newCertificates,
          ["baranggay." + data.placeOfWork]: updateCount,
          ["byMonth." + (currentDate.getMonth() + 1).toString()]:
            newCertificateCountByMonth,
          ["nationality." + data.nationality]: updateNationalityCount,
        });
      }
    });

    await addDoc(collection(db, "logs"), {
      created: serverTimestamp(),
      action: {value:"record_delete", text: "deleted a certificate"},
      target: data.id,
      userUID: currentUser.uid,
    });

    await deleteDoc(doc(db, "records", data.id))

    router.push("/dashboard")
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] bg-slate-100">
        <DialogHeader>
          <DialogTitle>Certificate</DialogTitle>
        </DialogHeader>
        <div className="p-4 place-content-center overflow-auto">
          <div className="w-[700px] m-auto">
            {!isEdit ? <Certificate data={data} /> : <EditCertificate />}
          </div>
        </div>
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

const EditCertificate = () => {
  return <div>editing
    <br /> or
    <br /> no
    <br /> data issued
    <br /> occupation
    <br /> nationality
    <br /> place of work
    <br /> company
    <br /> date issuance
  </div>;
};

const Filter = ({ searchParams, hidden }) => {
  const defaultFilter = (() => {
    switch (searchParams.get("filter")) {
      case "month":
        return "byMonth";
      case "year":
        return "byYear";
      case "company":
        return "byCompany";

      default:
        return "none";
    }
  })();

  const filterDataDefault = {
    month: searchParams.has("month") ? searchParams.get("month") : "",
    year: searchParams.has("year") ? searchParams.get("year") : "",
    company: searchParams.has("company") ? searchParams.get("company") : "",
  };

  const [filter, setFilter] = useState(defaultFilter);
  const [filterData, setFilterData] = useState(filterDataDefault);
  const router = useRouter();

  const handleSearch = () => {
    let search = "";
    switch (filter) {
      case "byMonth":
        if (filterData.month != "" && filterData.year != "") {
          search =
            "filter=month&month=" +
            filterData.month.toString().padStart(2, 0) +
            "&year=" +
            filterData.year;
        }
        break;
      case "byYear":
        if (filterData.year != "") {
          search = "filter=year&year=" + filterData.year;
        }
        break;
      case "byCompany":
        if (filterData.company != "") {
          search = "filter=company&company=" + filterData.company;
        }
        break;
    }
    router.push("/dashboard?" + search);
  };

  return (
    <div
      className={
        "grid mt-2 grid-cols-[1fr_2fr_1fr] gap-2 bg-slate-400 p-2 rounded-md " +
        (!hidden ? "hidden " : "")
      }
    >
      <SelectOption
        title={"Choose Filter"}
        data={[
          { value: "none", text: "No filter" },
          { value: "byMonth", text: "By Month" },
          { value: "byYear", text: "By Year" },
          { value: "byCompany", text: "By Company" },
        ]}
        value={filter}
        onValueChange={(value) => {
          setFilter(value);
          setFilterData(filterDataDefault);
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        {filter == "byMonth" && (
          <>
            <SelectOption
              className="w-full mx-1"
              title="Select Month"
              data={months}
              value={filterData.month}
              onValueChange={(value) => {
                setFilterData({ ...filterData, month: value });
              }}
            />
            <SelectOption
              className="w-full mx-1"
              title="Year"
              data={reversedYears}
              value={filterData.year}
              onValueChange={(value) => {
                setFilterData({ ...filterData, year: value });
              }}
            />
          </>
        )}
        {filter == "byYear" && (
          <>
            <SelectOption
              className="w-full mx-1"
              title="Select Year"
              data={reversedYears}
              value={filterData.year}
              onValueChange={(value) => {
                setFilterData({ ...filterData, year: value });
              }}
            />
          </>
        )}
        {filter == "byCompany" && (
          <Input
            className="col-span-2"
            type="text"
            placeholder="Company Name"
            value={filterData.company}
            onChange={(e) => {
              setFilterData({ ...filterData, company: e.target.value });
            }}
          />
        )}
      </div>
      <div className="grid place-items-end">
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
};

export default Records;
