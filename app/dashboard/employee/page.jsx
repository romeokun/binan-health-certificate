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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { auth } from "@/config/firebase";
import { nationalities, baranggays } from "@/config/local";

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

function employeesQuery({
  setSnap,
  setLoading,
  setCallback,
  loadAfter,
  conditions = [],
}) {
  setLoading(true);
  loadQuery({
    collectionID: "employees",
    order: orderBy("created", "desc"),
    setSnap,
    setLoading,
    loadAfter,
    conditions,
  }).then((result) => {
    setSnap((previous) => {
      return setCallback({ prev: previous, res: result });
    });
    setLoading(false);
  });
}

function loadMoreEmployees({ setSnap, setLoading, cursor, conditions = [] }) {
  employeesQuery({
    setSnap,
    setLoading,
    conditions,
    loadAfter: startAfter(cursor),
    setCallback: ({ prev, res }) => {
      return [...prev, ...res.docs];
    },
  });
}

function initializeEmployees({ setSnap, setLoading, conditions = [] }) {
  employeesQuery({
    setSnap,
    setLoading,
    conditions,
    setCallback: ({ res }) => {
      return [...res.docs];
    },
  });
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
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(searchParams.has("id"));
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [tableQuery, setQuery] = useState([]);
  const [tableQuerying, setTableQuerying] = useState(false);

  const initialized = useRef(false);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }

    if (!initialized.current) {
      try {
        initializeEmployees({
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
      loadDoc(searchParams.get("id"), setEmployee, setIsQuerying);
      setShowDialog(true);
    } else {
      setEmployee(null);
      setShowDialog(false);
    }
  }, [searchParams]);

  useEffect(() => {}, [tableQuery]);
  const handleTableReload = () => {
    initializeEmployees({ setSnap: setQuery, setLoading: setTableQuerying });
  };

  const handleLoadMore = (e) => {
    loadMoreEmployees({
      setSnap: setQuery,
      setLoading: setTableQuerying,
      cursor: tableQuery.at(tableQuery.length - 1),
    });
  };

  return (
    <>
      <div className="grid mt-2 grid-cols-[1fr_min-content]">
        <div></div>
        <div className="grid grid-cols-[min-content_min-content_min-content]">
          <Button className="mx-1">Filter</Button>
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
    // setdoc
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
      .then((response) => {
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
                        <span>{cert.data().dateIssuance.split("-")[0]}</span>
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

const AddCertificateDialog = ({ employee }) => {
  const { currentUser } = useContext(AuthContext);
  const currentDate = new Date();
  const currentDateString =
    currentDate.getFullYear().toString() +
    "-" +
    (currentDate.getMonth() + 1).toString().padStart(2, 0) +
    "-" +
    currentDate.getDate().toString().padStart(2, 0);

  const dataDefault = {
    company: "",
    dateIssuance: currentDateString,
    dateIssued: currentDateString,
    employee: doc(db, "employees", employee.id),
    employeeID: employee.id,
    employeeName: employee.data().name,
    issuerID: currentUser.uid,
    nationality: "Filipino",
    no: "",
    occupation: "",
    or: "",
    placeOfWork: "Biñan",
    sex: employee.data().sex.charAt(0).toUpperCase(),
  };

  const [data, setData] = useState(dataDefault);
  const router = useRouter();

  const handleOnOpenChange = (open) => {
    if (!open) {
      setData(dataDefault);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.target.disabled = true;
    if (data.dateIssued) {
      try {
        getDoc(doc(db, "users", currentUser.uid))
          .then((res) => {
            return addToDatabase({
              collectionID: "records",
              data: {
                ...data,
                issuerName: res.data().name,
                age: currentDate.getFullYear() - +employee.data().birthyear,
                created: serverTimestamp(),
              },
            });
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
              <AddInput data={data} setData={setData} title="OR" value="or" />
              <AddInput data={data} setData={setData} title="No" value="no" />
              <AddInput
                data={data}
                setData={setData}
                title="Occupation"
                value="occupation"
              />
              <AddInput
                data={data}
                setData={setData}
                title="Company Name"
                value="company"
              />
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
                <Label className="text-right">Place of Work</Label>
                <SelectOption
                  value={data.placeOfWork}
                  className="col-span-3"
                  data={baranggays.map((baranggay) => {
                    return { value: baranggay, text: baranggay };
                  })}
                  onValueChange={(value) => {
                    setData({ ...data, placeOfWork: value });
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
                <Label className="text-right">Date Issued</Label>
                <input
                  type="date"
                  className="col-span-3 border px-3 py-2 rounded-md"
                  onChange={(e) => {
                    setData({ ...data, dateIssued: e.target.value });
                  }}
                  value={data.dateIssued}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 w-[400px] ">
                <Label className="text-right">Date Issuance</Label>
                <input
                  type="date"
                  className="col-span-3 border px-3 py-2 rounded-md"
                  onChange={(e) => {
                    setData({ ...data, dateIssuance: e.target.value });
                  }}
                  value={data.dateIssuance}
                />
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
  const [data, setData] = useState({
    name: "",
    birthyear: "",
    sex: "",
  });

  const router = useRouter();
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      setData({
        name: "",
        birthyear: "",
        sex: "",
        created: "",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.disabled = true;

    if (data.name != "" && data.birthyear != "" && data.sex != "") {
      try {
        addToDatabase({
          collectionID: "employees",
          data: {
            ...data,
            created: serverTimestamp(),
          },
        }).then((ref) => {
          set(false);
          setData({
            name: "",
            birthyear: "",
            sex: "",
            created: "",
          });
          reload();
          router.push("/dashboard/employee?id=" + ref.id);
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
            <Label className="text-right">Birthyear</Label>
            <Input
              required
              type="text"
              pattern="[0-9]+"
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              value={data.birthyear}
              onChange={(e) => {
                if (!e.target.value.match("[^0-9]$")) {
                  setData({ ...data, birthyear: e.target.value });
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

export default Employee;
