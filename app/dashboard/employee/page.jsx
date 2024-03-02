"use client";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

async function loadQuery({
  collectionID,
  order,
  setSnap,
  setLoading,
  condition,
}) {
  setSnap("");
  setLoading(true);
  const q = condition
    ? query(collection(db, collectionID), condition, order)
    : query(collection(db, collectionID), order);
  const querySnapshot = await getDocs(q);
  setSnap(querySnapshot);
  setLoading(false);
}

function employeesQuery({ setSnap, setLoading }) {
  loadQuery({
    collectionID: "employees",
    order: orderBy("created", "desc"),
    setSnap,
    setLoading,
  });
}

function certificatesQuery({ setSnap, setLoading, employeeID }) {
  loadQuery({
    collectionID: "records",
    order: orderBy("dateIssuance", "desc"),
    condition: where("employee", "==", employeeID),
    setSnap,
    setLoading,
  });
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
  const [query, setQuery] = useState(null);
  const [tableQuerying, setTableQuerying] = useState(false);

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }

    try {
      employeesQuery({ setSnap: setQuery, setLoading: setTableQuerying });
    } catch (error) {
      console.error(error);
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

  const handleTableReload = () => {
    employeesQuery({ setSnap: setQuery, setLoading: setTableQuerying });
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
      <ScrollArea className="mt-4 h-[400px]">
        <Table>
          <TableCaption>
            {tableQuerying ? "loading" : null}
            {/* {query?.docs && !tableQuerying && "Showing 1 of 10" } */}
            {!query?.docs && !tableQuerying && "Nothing to Show"}
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
            {query?.docs?.map((data) => {
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

  const router = useRouter();
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      router.push("/dashboard/employee");
    }
  };

  const [isEdit, setIsEdit] = useState(false);
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

  const handleEdit = () => {
    setIsEdit(true);
  };
  const handleCancel = () => {
    setIsEdit(false);
    setData({
      name: employee?.data().name,
      birthyear: employee?.data().birthyear,
      sex: employee?.data().sex,
      created: employee?.data().created,
    });
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
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
                setData({ ...data, birthyear: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-2">
            <h3 className="p-1">Certificates</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4 col-span-2">
              {certificatesLoading ? <>Loading </> : null}
              {!certificatesLoading && certificates?.docs.length == 0 ? (
                <>None</>
              ) : null}
              {certificates?.docs?.map((cert) => {
                const dateData = cert.data().dateIssuance.toDate();
                return (
                  <Link
                    key={cert.id}
                    href={{
                      pathname: "/dashboard",
                      query: { id: cert.id },
                    }}
                  >
                    <div className="grid grid-cols-4 bg-accent hover:bg-slate-400 p-2 rounded">
                      <span>{format(dateData, "yyyy")}</span>
                      <span className="col-span-3">{cert.data().company}</span>
                    </div>
                  </Link>
                );
              })}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          {isEdit ? (
            <>
              <Button onClick={handleCancel} type="">
                Cancel
              </Button>
              <Button type="">Save</Button>
            </>
          ) : (
            <>
              <Button variant="destructive">Delete</Button>
              <Button onClick={handleEdit} type="">
                Edit
              </Button>
              <Button variant="">Add</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
              {" "}
              {x.text}{" "}
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

        ref.then((result) => console.log(result));
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
