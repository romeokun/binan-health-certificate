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
import { auth } from "@/config/firebase";
import Link from "next/link";
import { Loading } from "@/components/loading";

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

import * as XLSX from "xlsx";
function Records() {
  const { currentUser, isLoading } = useContext(AuthContext);
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [tableQuery, setQuery] = useState([]);
  const [tableQuerying, setTableQuerying] = useState(false);
  const endOfQuery = useRef(false);
  const [certificate, setCertificate] = useState(null);
  const [showFilter, setShowFilter] = useState(searchParams.has("filter"));
  const router = useRouter();

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
        return [where("placeOfWork", "==", searchParams.get("company"))];
      case "or":
        return [where("or", "==", searchParams.get("or"))];
      case "no":
        return [where("no", "==", searchParams.get("no"))];

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

  const reloadCertificate = () => {
    getDoc(doc(db, "records", searchParams.get("id"))).then((res) => {
      if (res.exists()) {
        setCertificate(res);
      }
    });
  };

  const handlePrint = () => {
    auth.currentUser
      .getIdToken(false)
      .then(function (idToken) {
        return fetch("https://printrecords-q24eqvlj5q-uc.a.run.app/", {
          method: "POST",
          headers: new Headers({
            Authorization: "Bearer " + idToken,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            month: searchParams.get("month") ? searchParams.get("month") : null,
            year: searchParams.get("year") ? searchParams.get("year") : null,
            company: searchParams.get("company")
              ? searchParams.get("company")
              : null,
            or: searchParams.get("or")
              ? searchParams.get("or")
              : null,
            no: searchParams.get("no")
              ? searchParams.get("no")
              : null,
          }),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const str = res.print;
        console.log(str);

        let fileName = "";
        if (searchParams.get("month")) {
          fileName += searchParams.get("month") + "-";
        }
        if (searchParams.get("year")) {
          fileName += searchParams.get("year");
        }
        if (searchParams.get("company")) {
          fileName += searchParams.get("company");
        }

        fileName = fileName ? fileName : "all";

        const worksheet = XLSX.utils.json_to_sheet(str);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");
        XLSX.writeFile(workbook, fileName + ".xlsx", { compression: true });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (currentUser) {
    return (
      <>
        <div className="grid mt-2 grid-cols-[1fr_min-content]">
          <div className="grid content-center">
            <span>
              Showing {!searchParams.has("filter") && "All"}
              {searchParams.has("filter") &&
                searchParams.has("month") &&
                months.find((x) => x.value == searchParams.get("month"))?.text +
                  " "}
              {searchParams.has("filter") &&
                searchParams.has("year") &&
                searchParams.get("year") + " "}
              {searchParams.has("filter") &&
                searchParams.has("company") &&
                "Company: " + searchParams.get("company") + " "}
              {searchParams.has("filter") &&
                searchParams.has("or") &&
                "Or: " + searchParams.get("or") + " "}
              {searchParams.has("filter") &&
                searchParams.has("no") &&
                "No: " + searchParams.get("no") + " "}
            </span>
          </div>
          <div className="grid grid-cols-[min-content_min-content_min-content]">
            <Button
              className="mx-1"
              onClick={() => {
                setShowFilter(!showFilter);
              }}
            >
              Filter
            </Button>
            <Button className="mx-1" onClick={handlePrint}>
              Print
            </Button>
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
              <Loading />
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
        <View
          open={showDialog}
          set={setShowDialog}
          certificate={certificate}
          reloadCertificate={reloadCertificate}
        />
      </>
    );
  } else {
    return <>Not Authorized</>;
  }
}

const CertificateRow = ({ data, ...props }) => {
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
      <TableCell>{data.data().placeOfWork}</TableCell>
      <TableCell className="">{data.data().occupation}</TableCell>
      <TableCell className="text-center">
        {data.data().dateIssued.year}
      </TableCell>
    </TableRow>
  );
};

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

import { Certificate } from "@/components/dashboard/certificate";
import { useReactToPrint } from "react-to-print";
const View = ({ certificate, children, set, reloadCertificate, ...props }) => {
  // use employee object to display

  const { currentUser } = useContext(AuthContext);
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const currentDate = new Date();
  const componentToPrint = useRef();
  const toDateIssued = (date = "0000-00-00") => {
    return {
      full: date,
      year: date.slice(0, 4),
      month: date.slice(5, 7),
      day: date.slice(8, 10),
    };
  };

  const [data, setData] = useState(null);

  const defaultTableData = [...Array(9).keys()].map((x, index) => {
    return { key: index + 1, "col-1": "", "col-2": "", "col-3": "" };
  });

  useEffect(() => {
    if (certificate) {
      console.log("table ", certificate.data().exams);

      let tmp = certificate.data();
      if (!certificate.data().exams) {
        tmp = { ...tmp, exams: defaultTableData };
      }

      setData({
        ...tmp,
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
        id: certificate.id,
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
    if (
      JSON.stringify(data) ==
      JSON.stringify({
        ...certificate?.data(),
        id: certificate.id,
      })
    ) {
      setIsEdit(false);
    } else {
      const { id, ...updateRecord } = data;
      setDoc(doc(db, "records", certificate.id), {
        ...updateRecord,
      })
        .then(async (res) => {
          setIsEdit(false);
          return runTransaction(db, async (transaction) => {
            const ref = doc(db, "analytics", data.dateIssued.year.toString());
            const analytics = await transaction.get(ref);

            const dataUpdate = {};

            if (updateRecord.barangay != certificate.data().barangay) {
              dataUpdate["baranggay." + certificate.data().barangay] =
                analytics.data().baranggay[certificate.data().barangay]
                  ? analytics.data().baranggay[certificate.data().barangay] - 1
                  : 0;

              dataUpdate["baranggay." + updateRecord.barangay] =
                analytics.data().baranggay[updateRecord.barangay]
                  ? analytics.data().baranggay[updateRecord.barangay] + 1
                  : 1;
            }

            if (updateRecord.category != certificate.data().category) {
              dataUpdate["category." + certificate.data().category] =
                analytics.data().category[certificate.data().category]
                  ? analytics.data().category[certificate.data().category] - 1
                  : 0;

              dataUpdate["category." + updateRecord.category] = analytics.data()
                .category[updateRecord.category]
                ? analytics.data().category[updateRecord.category] + 1
                : 1;
            }

            if (updateRecord.nationality != certificate.data().nationality) {
              dataUpdate["nationality." + certificate.data().nationality] =
                analytics.data().nationality[certificate.data().nationality]
                  ? analytics.data().nationality[
                      certificate.data().nationality
                    ] - 1
                  : 0;

              dataUpdate["nationality." + updateRecord.nationality] =
                analytics.data().nationality[updateRecord.nationality]
                  ? analytics.data().nationality[updateRecord.nationality] + 1
                  : 1;
            }

            transaction.update(ref, dataUpdate);
          });
        })
        .then(async (res) => {
          await addDoc(collection(db, "logs"), {
            created: serverTimestamp(),
            action: { value: "record_edit", text: "edited a certificate" },
            target: data.id,
            userUID: currentUser.uid,
          });
          reloadCertificate();
        });
    }
  };

  const handleDelete = async (e) => {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, "analytics", data.dateIssued.year);
      const analytics = await transaction.get(ref);
      if (!analytics.exists()) {
        await setDoc(doc(db, "analytics", data.dateIssued.year), {
          numberOfCertificates: 0,
          baranggay: { [data.barangay]: 0 },
          category: { [data.category]: 0 },
          byMonth: { [data.dateIssued.month.toString().padStart(2, 0)]: 0 },
          nationality: { [data.nationality]: 0 },
        });
      } else {
        const certificateCount = analytics.data().numberOfCertificates;
        const newCertificates = (certificateCount ? certificateCount : 0) - 1;

        const certificateCountByMonth =
          analytics.data().byMonth?.[
            data.dateIssued.month.toString().padStart(2, 0)
          ];
        const newCertificateCountByMonth =
          (certificateCountByMonth ? certificateCountByMonth : 0) - 1;

        const baranggayCount = analytics.data().baranggay?.[data.barangay];
        const updateCount = (baranggayCount ? baranggayCount : 0) - 1;

        const categoryCount = analytics.data().category?.[data.category];
        const updateCategoryCount = (categoryCount ? categoryCount : 0) - 1;

        const nationalityCount =
          analytics.data().nationality?.[data.nationality];
        const updateNationalityCount =
          (nationalityCount ? nationalityCount : 0) - 1;
        transaction.update(ref, {
          numberOfCertificates: newCertificates,
          ["category." + data.category]: updateCategoryCount,
          ["baranggay." + data.barangay]: updateCount,
          ["byMonth." + (currentDate.getMonth() + 1).toString().padStart(2, 0)]:
            newCertificateCountByMonth,
          ["nationality." + data.nationality]: updateNationalityCount,
        });
      }
    });

    await addDoc(collection(db, "logs"), {
      created: serverTimestamp(),
      action: { value: "record_delete", text: "deleted a certificate" },
      target: data.id,
      userUID: currentUser.uid,
    });

    await deleteDoc(doc(db, "records", data.id));

    router.push("/dashboard");
  };

  const handlePrint = useReactToPrint({
    content: () => componentToPrint.current,
  });

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] bg-slate-100 grid-rows-[min-content_1fr_min-content]">
        <DialogHeader>
          <DialogTitle>Certificate</DialogTitle>
        </DialogHeader>
        <div className="p-4 place-content-center overflow-auto">
          <div className="w-[700px] m-auto">
            {!isEdit ? (
              <Certificate ref={componentToPrint} data={data} />
            ) : (
              <EditCertificate data={data} setData={setData} />
            )}
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
              <Link href={"/dashboard/employee?id=" + data?.employeeID}>
                <Button>Employee</Button>
              </Link>
              <Button onClick={handlePrint} type="">
                Print
              </Button>
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

import { nationalities, baranggays } from "@/config/local";
const EditCertificate = ({ data, setData }) => {
  const handleTableChange = (e, key) => {
    const { name, value } = e.target;
    const newData = data.exams.map((x) => {
      if (x.key == key) {
        return { ...x, [name]: value };
      } else {
        return x;
      }
    });

    setData({ ...data, exams: newData });
  };
  return (
    <div className="shadow-md border p-4 min-h-full">
      Edit Certificate
      <div className="mt-4 grid gap-4 min-w-[300px]">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Name</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.employeeName}
            disabled
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">OR No</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.or}
            onChange={(e) => {
              setData({ ...data, or: e.target.value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">No</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.no}
            onChange={(e) => {
              setData({ ...data, no: e.target.value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4 ">
          <Label className="text-right">Category</Label>
          <SelectOption
            value={data.category}
            className="col-span-3"
            data={[
              { value: "food", text: "Food" },
              { value: "nonfood", text: "Non Food" },
            ]}
            onValueChange={(value) => {
              setData({ ...data, category: value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Occupation</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.occupation}
            onChange={(e) => {
              setData({ ...data, occupation: e.target.value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Place of Work</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.placeOfWork}
            onChange={(e) => {
              setData({ ...data, placeOfWork: e.target.value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4 ">
          <Label className="text-right">Barangay</Label>
          <SelectOption
            value={data.barangay}
            className="col-span-3"
            data={baranggays.map((baranggay) => {
              return { value: baranggay, text: baranggay };
            })}
            onValueChange={(value) => {
              setData({ ...data, barangay: value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4 ">
          <Label className="text-right">Nationality</Label>
          <SelectOption
            value={data.nationality}
            className="col-span-3"
            data={nationalities}
            onValueChange={(value) => {
              setData({ ...data, nationality: value });
            }}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Issuer Name</Label>
          <Input
            className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
            type="text"
            value={data.issuerName}
            onChange={(e) => {
              setData({ ...data, issuerName: e.target.value });
            }}
          />
        </div>

        <div className="grid grid-rows-[min-content)] border border-black p-2">
          <div className="text-center">Exam Table</div>
          <div className="grid grid-cols-3">
            <span className="border border-black">DATE</span>
            <span className="border border-black">KIND</span>
            <span className="border border-black">RESULT</span>
          </div>

          {data.exams.map((x) => {
            return (
              <div className="grid grid-cols-3" key={x.key}>
                <input
                  onChange={(e) => handleTableChange(e, x.key)}
                  value={x["col-1"]}
                  name="col-1"
                  type="text"
                  className="border border-black text-center"
                />
                <input
                  onChange={(e) => handleTableChange(e, x.key)}
                  value={x["col-2"]}
                  name="col-2"
                  type="text"
                  className="border border-black text-center"
                />
                <input
                  onChange={(e) => handleTableChange(e, x.key)}
                  value={x["col-3"]}
                  name="col-3"
                  type="text"
                  className="border border-black text-center"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
      case "or":
        return "byOr";
      case "no":
        return "byNo";

      default:
        return "none";
    }
  })();

  const filterDataDefault = {
    month: searchParams.has("month") ? searchParams.get("month") : "",
    year: searchParams.has("year") ? searchParams.get("year") : "",
    company: searchParams.has("company") ? searchParams.get("company") : "",
    or: searchParams.has("or") ? searchParams.get("or") : "",
    no: searchParams.has("no") ? searchParams.get("no") : "",
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
      case "byOr":
        if (filterData.or != "") {
          search = "filter=or&or=" + filterData.or;
        }
        break;
      case "byNo":
        if (filterData.no != "") {
          search = "filter=no&no=" + filterData.no;
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
          { value: "byYear", text: "By Year" },
          { value: "byOr", text: "By OR No." },
          { value: "byNo", text: "By No." },
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
        {filter == "byOr" && (
          <Input
            className="col-span-2"
            type="text"
            placeholder="OR number"
            value={filterData.or}
            onChange={(e) => {
              setFilterData({ ...filterData, or: e.target.value });
            }}
          />
        )}
        {filter == "byNo" && (
          <Input
            className="col-span-2"
            type="text"
            placeholder="No"
            value={filterData.no}
            onChange={(e) => {
              setFilterData({ ...filterData, no: e.target.value });
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
