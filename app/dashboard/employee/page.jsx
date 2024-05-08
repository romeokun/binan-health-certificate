"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
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
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { auth } from "@/config/firebase";
import { nationalities, baranggays } from "@/config/local";
import Image from "next/image";
import NoProfileImg from "@/public/no-profile-picture-icon.png";
import { Loading } from "@/components/loading";

const PAGELIMIT = 25;

function handleQuery(array = []) {
  // return array.filter(x => x !== null)
  const x = array.filter((x) => x);
  return x;
}
async function loadQuery({ collectionID, order, conditions, loadAfter }) {
  const q = query(
    collection(db, collectionID),
    ...handleQuery([order, ...conditions, loadAfter]),
    limit(PAGELIMIT)
  );

  return getDocs(q);
}

function certificatesQuery({ setSnap, setLoading, employeeID }) {
  setSnap("");
  setLoading(true);
  loadQuery({
    collectionID: "records",
    order: orderBy("dateIssuance", "desc"),
    conditions: [where("employeeID", "==", employeeID)],
  }).then((result) => setSnap(result));
  setLoading(false);
}

async function loadDoc(id, setEmployee, setIsQuerying) {
  setEmployee("");
  setIsQuerying(true);
  const docRef = doc(db, "employees", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    setEmployee(docSnap);
  } else {
    // docSnap.data() will be undefined in this case
  }
  setIsQuerying(false);
}

function Employee() {
  const { currentUser, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(searchParams.has("id"));
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [tableQuery, setQuery] = useState([]);
  const [tableQuerying, setTableQuerying] = useState(false);
  const endOfQuery = useRef(false);
  const [showFilter, setShowFilter] = useState(searchParams.has("filter"));

  const filter = (() => {
    switch (searchParams.get("filter")) {
      case "name":
        return [where("name", "==", searchParams.get("name"))];

      default:
        return [];
    }
  })();

  function initializeEmployees() {
    setTableQuerying(true);
    setQuery(null);
    loadQuery({
      collectionID: "employees",
      order: orderBy("created", "desc"),
      conditions: filter,
    }).then((result) => {
      setQuery(result.docs);
      setTableQuerying(false);
      if (result.docs.length < PAGELIMIT) endOfQuery.current = true;
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
    initializeEmployees();
    if (searchParams.has("id")) {
      loadDoc(searchParams.get("id"), setEmployee, setIsQuerying);
      setShowDialog(true);
    } else {
      setEmployee(null);
      setShowDialog(false);
    }
  }, [searchParams]);

  useEffect(() => {}, [tableQuery]);
  const handleTableReload = () => {
    initializeEmployees();
  };

  const handleLoadMore = (e) => {
    setTableQuerying(true);
    loadQuery({
      collectionID: "employees",
      order: orderBy("created", "desc"),
      loadAfter: startAfter(tableQuery[tableQuery.length - 1]),
      conditions: [],
    }).then((result) => {
      setQuery([...tableQuery, ...result.docs]);
      setTableQuerying(false);
      if (result.docs.length <= 0) {
        endOfQuery.current = true;
      }
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
                searchParams.has("name") &&
                searchParams.get("name") + " "}
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
            <Button
              className="mx-1"
              onClick={() => {
                setShowNewDialog(true);
              }}
            >
              New
            </Button>
            <Button
              id="reload-table"
              onClick={handleTableReload}
              className="mx-1"
              variant="outline"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
        <Filter hidden={showFilter} searchParams={searchParams} />
        <ScrollArea className="mt-4 ">
          <Table>
            <TableCaption>
              {/* {query?.docs && !tableQuerying && "Showing 1 of 10" } */}
              {!tableQuery && !tableQuerying && "Nothing to Show"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Created</TableHead>
                <TableHead className="">Name</TableHead>
                <TableHead className="w-[10ch]">Sex</TableHead>
                <TableHead className="w-[10ch]">Birthyear</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableQuery?.map((data) => {
                const created = data.data().created.toDate();
                return (
                  <TableRow key={data.id}>
                    <TableCell className="font-medium">
                      {format(created, "PP")}
                    </TableCell>
                    <TableCell>{data.data().name}</TableCell>
                    <TableCell className="">
                      {data.data().sex.charAt(0).toUpperCase() +
                        data.data().sex.slice(1)}
                    </TableCell>
                    <TableCell className="">{data.data().birthyear}</TableCell>
                    <TableCell className="grid place-items-center">
                      <Link
                        href={{
                          pathname: "/dashboard/employee",
                          query: { id: data.id },
                        }}
                      >
                        <MoreHorizontal />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
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
        </ScrollArea>
        <View
          open={showDialog}
          employee={employee}
          isQuerying={isQuerying}
          set={setShowDialog}
        ></View>
        <NewDialog
          open={showNewDialog}
          set={setShowNewDialog}
          reload={handleTableReload}
        ></NewDialog>
      </>
    );
  } else {
    return <>Not Authorized</>;
  }
}

const View = ({ children, employee, isQuerying, set, ...props }) => {
  // use employee object to display

  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();

  const [data, setData] = useState({
    name: "",
    birthyear: "",
    sex: "",
    created: "",
  });
  const [certificates, setCertificates] = useState(null);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (employee) {
      setData({
        name: employee?.data().name,
        birthyear: employee?.data().birthyear,
        sex: employee?.data().sex,
        created: employee?.data().created,
      });

      certificatesQuery({
        setSnap: setCertificates,
        setLoading: setCertificatesLoading,
        employeeID: employee.id,
      });
    }
  }, [employee]);

  // loading state

  const handleEdit = () => {
    setIsEdit(true);
  };
  const handleCancel = () => {
    setIsEdit(false);
    if (employee?.data) {
      setData({
        ...employee?.data(),
      });
    }
  };
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      handleCancel();
      router.push("/dashboard/employee");
    }
  };

  const handleSave = (e) => {
    setDoc(doc(db, "employees", employee.id), data)
      .then((res) => {
        addDoc(collection(db, "logs"), {
          created: serverTimestamp(),
          action: { value: "employee_edit", text: "edited an employee info" },
          target: employee.id,
          userUID: currentUser.uid,
        });
      })
      .then(() => {
        setIsEdit(false);
      });
  };

  const handleDelete = async (e) => {
    if (!employee) return;

    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/delete-employee", {
          method: "POST",
          body: JSON.stringify({ token: idToken, employeeID: employee.id }),
        });
      })
      .then(async (response) => {
        addDoc(collection(db, "logs"), {
          created: serverTimestamp(),
          action: { value: "employee_delete", text: "deleted an employee" },
          target: { id: employee.id, name: employee.data().name },
          userUID: currentUser.uid,
        });

        router.push("/dashboard/employee");
      })
      .catch(function (error) {
        // Handle error
        console.error("failed to delete");
        console.error(error);
      });
  };

  // loading state
  if (isQuerying) {
    return (
      <Dialog onOpenChange={handleOnOpenChange} {...props}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4">Loading</div>
        </DialogContent>
      </Dialog>
    );
  }
  // not found state
  if (!employee && !isQuerying) {
    return (
      <Dialog onOpenChange={handleOnOpenChange} {...props}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4">Not found</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea type="auto" className="max-h-[50vh] p-4">
          <div className="mt-4 grid gap-4 min-w-[300px]">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Employee ID</Label>
              <Input
                className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
                disabled
                type="text"
                defaultValue={employee?.id}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <Input
                className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
                disabled
                type="text"
                value={
                  data?.created
                    ? format(data.created.toDate(), "PPpp")
                    : "cannot read"
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
                disabled={!isEdit}
                type="text"
                value={data?.name}
                onChange={(e) => {
                  setData({ ...data, name: e.target.value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Sex</Label>
              <SelectOption
                className="disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
                disabled={!isEdit}
                data={[
                  { value: "male", text: "Male" },
                  { value: "female", text: "Female" },
                ]}
                value={data?.sex}
                onValueChange={(value) => {
                  setData({ ...data, sex: value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Birthyear</Label>
              <Input
                disabled={!isEdit}
                type="text"
                pattern="[0-9]+"
                className="col-span-3 disabled:cursor-default disabled:opacity-100 disabled:bg-accent"
                value={data?.birthyear}
                onChange={(e) => {
                  if (!e.target.value.match("[^0-9]$")) {
                    setData({ ...data, birthyear: e.target.value });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2">
              <h3 className="p-1">Certificates</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4 col-span-2">
                {certificatesLoading ? <>Loading </> : null}
                {!certificatesLoading && certificates?.docs?.length == 0 ? (
                  <>None</>
                ) : null}
                {certificates?.docs?.map((cert) => {
                  return (
                    <Link
                      key={cert.id}
                      href={{
                        pathname: "/dashboard",
                        query: { id: cert.id },
                      }}
                    >
                      <div className="grid grid-cols-4 bg-accent hover:bg-slate-400 p-2 rounded mt-2">
                        <span>{cert.data().dateIssued.year}</span>
                        <span className="col-span-3">
                          {cert.data().company}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </ScrollArea>
            </div>
          </div>
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
                      the profile and its records.
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
              <AddCertificateDialog employee={employee} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { ref, uploadBytes } from "firebase/storage";
import { storageDB } from "@/config/firebase";
const AddCertificateDialog = ({ employee }) => {
  const { currentUser } = useContext(AuthContext);
  const currentDate = new Date();
  const currentDateString =
    currentDate.getFullYear().toString() +
    "-" +
    (currentDate.getMonth() + 1).toString().padStart(2, 0) +
    "-" +
    currentDate.getDate().toString().padStart(2, 0);

  const toDateIssued = (date = "0000-00-00") => {
    return {
      full: date,
      year: date.slice(0, 4),
      month: date.slice(5, 7),
      day: date.slice(8, 10),
    };
  };

  const defaultTableData = [...Array(9).keys()].map((x, index) => {
    return { key: index + 1, "col-1": "", "col-2": "", "col-3": "" };
  });

  const [tableData, setTableData] = useState(defaultTableData);

  const handleTableChange = (key, ...e) => {
    const newData = tableData.map((x) => {
      if (x.key == key) {
        return Object.assign({}, x, ...e);
      } else {
        return x;
      }
    });

    setTableData(newData);
  };

  const dataDefault = {
    dateIssuance: currentDateString,
    dateIssued: toDateIssued(currentDateString),
    employee: doc(db, "employees", employee.id),
    employeeID: employee.id,
    employeeName: employee.data().name,
    issuerID: currentUser.uid,
    nationality: "Filipino",
    no: "",
    occupation: "",
    category: "food",
    or: "",
    placeOfWork: "",
    barangay: "Biñan",
    sex: employee.data().sex.charAt(0).toUpperCase(),
  };

  const [data, setData] = useState(dataDefault);
  const router = useRouter();

  const [photo, setPhoto] = useState(NoProfileImg);
  const handleOnOpenChange = (open) => {
    if (!open) {
      setData(dataDefault);
      setPhoto(NoProfileImg);
    }
  };

  const imageInputRef = useRef(null);
  const handleAdd = (e) => {
    e.preventDefault();
    e.target.disabled = true;
    if (data.dateIssued) {
      try {
        addToDatabase({
          collectionID: "records",
          data: {
            ...data,
            issuerName: "MIRABELLE M. BENJAMIN, MD, MPH",
            age: currentDate.getFullYear() - +employee.data().birthyear,
            exams: tableData,
            created: serverTimestamp(),
          },
        })
          .then(async (res) => {
            // image upload
            if (imageInputRef.current.files[0]) {
              const uploadRef = ref(storageDB, "photos/" + res.id);
              uploadBytes(uploadRef, imageInputRef.current.files[0]);
            }
            // analytics
            await runTransaction(db, async (transaction) => {
              const ref = doc(db, "analytics", data.dateIssued.year.toString());
              const analytics = await transaction.get(ref);
              if (!analytics.exists()) {
                await setDoc(
                  doc(db, "analytics", currentDate.getFullYear().toString()),
                  {
                    numberOfCertificates: 0,
                    baranggay: { [data.barangay]: 0 },
                    category: { [data.category]: 0 },
                    byMonth: {
                      [data.dateIssued.month.toString().padStart(2, 0)]: 0,
                    },
                    nationality: { [data.nationality]: 0 },
                  }
                );
              } else {
                const certificateCount = analytics.data().numberOfCertificates;
                const newCertificates =
                  (certificateCount ? certificateCount : 0) + 1;

                const certificateCountByMonth =
                  analytics.data().byMonth?.[
                    data.dateIssued.month.toString().padStart(2, 0)
                  ];
                const newCertificateCountByMonth =
                  (certificateCountByMonth ? certificateCountByMonth : 0) + 1;

                const baranggayCount =
                  analytics.data().baranggay?.[data.barangay];
                const updateCount = (baranggayCount ? baranggayCount : 0) + 1;

                const categoryCount =
                  analytics.data().category?.[data.category];
                const updatecategoryCount =
                  (categoryCount ? categoryCount : 0) + 1;

                const nationalityCount =
                  analytics.data().nationality?.[data.nationality];
                const updateNationalityCount =
                  (nationalityCount ? nationalityCount : 0) + 1;
                transaction.update(ref, {
                  numberOfCertificates: newCertificates,
                  ["baranggay." + data.barangay]: updateCount,
                  ["byMonth." +
                  (currentDate.getMonth() + 1).toString().padStart(2, 0)]:
                    newCertificateCountByMonth,
                  ["nationality." + data.nationality]: updateNationalityCount,
                  ["category." + data.category]: updatecategoryCount,
                });
              }
            });

            await addDoc(collection(db, "logs"), {
              created: serverTimestamp(),
              action: { value: "record_add", text: "added a certificate" },
              target: res.id,
              userUID: currentUser.uid,
            });

            return res;
          })
          .then((ref) => {
            setData({
              name: "",
              birthyear: "",
              sex: "",
              created: "",
            });
            router.push("/dashboard?id=" + ref.id);
          });
      } catch (error) {
        console.error(error);
        e.target.disabled = true;
      }
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      let file = e.target.files[0];
      let url = URL.createObjectURL(file);
      setPhoto(url);
    } else {
      setPhoto(NoProfileImg);
    }
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange}>
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        Add
      </DialogTrigger>
      <DialogContent className="max-h-[500px]">
        <DialogHeader>
          <DialogTitle>Add Certificate</DialogTitle>
        </DialogHeader>
        <ScrollArea type="auto" className="max-h-[50vh]">
          <form className="mt-4 grid gap-4 p-4 pt-0">
            <div className="mt-4 grid gap-4 pb-4">
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
                <Label className="text-right">Upload Photo</Label>
                <Input
                  ref={imageInputRef}
                  type="file"
                  className="col-span-3"
                  accept=".jpg,.png"
                  onChange={handleImageUpload}
                />
                <div className="col-span-4 grid place-content-center relative h-[100px]">
                  <Image
                    src={photo}
                    fill={true}
                    className="object-contain"
                    alt="Certificate Photo"
                  />
                </div>
              </div>

              <AddInput data={data} setData={setData} title="OR" value="or" />
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
                <Label className="text-right">OR Date Issued</Label>
                <input
                  type="date"
                  className="col-span-3 border px-3 py-2 rounded-md"
                  onChange={(e) => {
                    setData({
                      ...data,
                      dateIssued: toDateIssued(e.target.value),
                    });
                  }}
                  value={data.dateIssued?.full}
                />
              </div>
              <AddInput data={data} setData={setData} title="No" value="no" />
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
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
              <AddInput
                data={data}
                setData={setData}
                title="Occupation"
                value="occupation"
              />
              <AddInput
                data={data}
                setData={setData}
                title="Place of Work"
                value="placeOfWork"
              />
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
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
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
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
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
                <Label className="text-right">Date Of Issuance</Label>
                <input
                  type="date"
                  className="col-span-3 border px-3 py-2 rounded-md"
                  onChange={(e) => {
                    setData({ ...data, dateIssuance: e.target.value });
                  }}
                  value={data.dateIssuance}
                />
              </div>
              <div className="grid grid-rows-[min-content)] border border-black p-2">
                <div className="text-center">Exam Table</div>
                <div className="grid grid-cols-3">
                  <span className="border border-black">DATE</span>
                  <span className="border border-black">KIND</span>
                  <span className="border border-black">RESULT</span>
                </div>

                {tableData.map((x) => {
                  return (
                    <TestRow key={data.key} data={x} handleTableChange={handleTableChange} />
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Button className="col-start-4" type="submit" onClick={handleAdd}>
                Add
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const TestRow = ({ data, handleTableChange }) => {
  return (
    <div className="grid grid-cols-3">
      <input
        onChange={(e) => handleTableChange(data.key, {"col-1": e.target.value})}
        value={data["col-1"]}
        name="date"
        type="text"
        className="border border-black text-center"
        readOnly={data["col-2"] == "" || !data["col-2"]}
      />
      <select
        name="value"
        value={data["col-2"]}
        onChange={(e) => {
          handleTableChange(data.key, {
            "col-2": e.target.value,
            "col-1": "",
            "col-3": "",
          });
        }}
      >
        <option value="">Empty</option>
        <option value="H&S SEMINAR">Health and Sanitation Seminar</option>
        <option value="FECALYSIS">Fecalysis</option>
        <option value="X-RAY">Chest X-Ray</option>
        <option value="DRUG TEST">Drug Test</option>
        <option value="URINALYSIS">Urinalysis</option>
        <option value="VDRL TEST">VDRL test</option>
        <option value="GRAM&apos STAIN">Gram's Stain</option>
        <option value="HBSAG">HbsAg Screening Test</option>
        <option value="HIV">HIV</option>
        <option value="STD SEMINAR">STD Seminar</option>
      </select>
      <input
        onChange={(e) => handleTableChange(data.key, {"col-3": e.target.value})}
        value={data["col-3"]}
        name="result"
        type="text"
        className="border border-black text-center"
        readOnly={data["col-2"] == "" || !data["col-2"]}
      />
    </div>
  );
};

const AddInput = ({ data, setData, title, value, className }) => {
  return (
    <div
      className={"grid grid-cols-4 items-center gap-4 w-[400px] " + className}
    >
      <Label className="text-right">{title}</Label>
      <Input
        required
        className="col-span-3 disabled:cursor-default disabled:opacity-100"
        type="text"
        value={data[value]}
        onChange={(e) => {
          setData({ ...data, [value]: e.target.value });
        }}
      />
    </div>
  );
};

const SelectOption = ({ title, data, className, ...props }) => {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {data?.map((x) => {
          return (
            <SelectItem key={x.value} value={x.value}>
              {x.text}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

async function addToDatabase({ collectionID, data }) {
  return await addDoc(collection(db, collectionID), data);
}

const NewDialog = ({ children, set, reload, ...props }) => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({
    name: "",
    birthyear: "",
    sex: "",
  });
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const router = useRouter();
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      setData({
        name: "",
        currentAge: 0,
        birthyear: "",
        sex: "",
        created: "",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.disabled = true;
    const currentDate = new Date();

    if (data.name != "" && data.birthyear != "" && data.sex != "") {
      try {
        addToDatabase({
          collectionID: "employees",
          data: {
            ...data,
            created: serverTimestamp(),
          },
        }).then(async (res) => {
          await runTransaction(db, async (transaction) => {
            const ref = doc(
              db,
              "analytics",
              currentDate.getFullYear().toString()
            );
            const analytics = await transaction.get(ref);
            if (!analytics.exists()) {
              await setDoc(
                doc(db, "analytics", currentDate.getFullYear().toString()),
                {
                  numberOfNewEmployee: 0,
                }
              );
            } else {
              const employeeCount = analytics.data().numberOfNewEmployee;
              const newCount = (employeeCount ? employeeCount : 0) + 1;

              transaction.update(ref, {
                numberOfNewEmployee: newCount,
              });
            }
          });

          await addDoc(collection(db, "logs"), {
            created: serverTimestamp(),
            action: { value: "employee_add", text: "added an employee" },
            target: res.id,
            userUID: currentUser.uid,
          });

          set(false);
          setData({
            name: "",
            birthyear: "",
            sex: "",
            created: "",
          });
          reload();
          router.push("/dashboard/employee?id=" + res.id);
        });
      } catch (error) {
        console.error(error);
        e.target.disabled = true;
      }
    }
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Employee</DialogTitle>
        </DialogHeader>
        <form className="mt-4 grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="text"
              value={data.name}
              onChange={(e) => {
                setData({ ...data, name: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Sex</Label>
            <SelectOption
              required={true}
              className="disabled:cursor-default disabled:opacity-100"
              data={[
                { value: "male", text: "Male" },
                { value: "female", text: "Female" },
              ]}
              value={data.sex}
              onValueChange={(value) => {
                setData({ ...data, sex: value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Current age</Label>
            <Input
              required
              type="text"
              pattern="[0-9]+"
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              value={data.currentAge}
              onChange={(e) => {
                if (!e.target.value.match("[^0-9]$") && e.target.value != "") {
                  setData({
                    ...data,
                    currentAge: e.target.value,
                    birthyear: currentYear - e.target.value,
                  });
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Button
              className="col-start-4"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Filter = ({ searchParams, hidden }) => {
  const defaultFilter = (() => {
    switch (searchParams.get("filter")) {
      case "name":
        return "byName";
      case "employeeID":
        return "byID";

      default:
        return "none";
    }
  })();

  const [filterDataDefault, setDataDefault] = useState({
    name: searchParams.has("name") ? searchParams.get("name") : "",
    id: searchParams.has("employeeID") ? searchParams.get("employeeID") : "",
  });

  const [filter, setFilter] = useState(defaultFilter);
  const [filterData, setFilterData] = useState(filterDataDefault);
  const router = useRouter();

  const handleSearch = () => {
    let search = "";
    switch (filter) {
      case "byName":
        if (filterData.name != "") {
          search = "filter=name&name=" + filterData.name;
        }
        break;
      case "byID":
        if (filterData.id != "") {
          search = "id=" + filterData.id;
        }
        break;
    }
    router.push("/dashboard/employee?" + search);
  };

  useEffect(() => {
    setDataDefault({
      name: searchParams.has("name") ? searchParams.get("name") : "",
      id: searchParams.has("employeeID") ? searchParams.get("employeeID") : "",
    });
  }, [searchParams]);

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
          { value: "byName", text: "By Name" },
          { value: "byID", text: "By ID" },
        ]}
        value={filter}
        onValueChange={(value) => {
          setFilter(value);
          setFilterData(filterDataDefault);
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        {filter == "byName" && (
          <Input
            className="col-span-2"
            type="text"
            placeholder="Employee Name"
            value={filterData.name}
            onChange={(e) => {
              setFilterData({ ...filterData, name: e.target.value });
            }}
          />
        )}
        {filter == "byID" && (
          <Input
            className="col-span-2"
            type="text"
            placeholder="Employee ID"
            value={filterData.id}
            onChange={(e) => {
              setFilterData({ ...filterData, id: e.target.value });
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

export default Employee;
