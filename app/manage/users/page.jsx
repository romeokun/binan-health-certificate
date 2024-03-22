"use client";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/components/auth-provider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/config/firebase";
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

// todo: for admin, manage users such as add and change role
// 3 role: admin, normal, disabled
// admin must not able to change another admin

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

function Manage() {
  const { currentUser, isLoading } = useContext(AuthContext);
  const [table, setTable] = useState([]);
  const [error, setError] = useState({ isError: false, message: "" });
  const [tableQuerying, setTableQuerying] = useState(false);
  const router = useRouter();
  const nextPageToken = useRef(null);
  const [userNames, setUserNames] = useState({});
  const namesQuery = useRef([]);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const initialize = () => {
    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/get-users", {
          method: "POST",
          body: JSON.stringify({ token: idToken }),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTable(res.users);
        nextPageToken.current = res.nextPageToken;
      });
  };

  const runOnce = useRef(true);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }

    if (runOnce) {
      initialize();
      runOnce.current = false;
    }
  }, []);

  const handleLoadMore = () => {
    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/get-users", {
          method: "POST",
          body: JSON.stringify({
            token: idToken,
            nextPageToken: nextPageToken.current,
          }),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTable((prev) => [...prev, res.users]);
        nextPageToken.current = res.nextPageToken;
      });
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_min-content_min-content]">
        <div></div>
        <Button
          className="mx-1"
          onClick={() => {
            // setShowFilter(!showFilter);
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
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Created</TableHead>
            <TableHead className="w-[250px]">User UID</TableHead>
            <TableHead className="">Name</TableHead>
            <TableHead className="w-[100px]">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.map((element) => {
            if (!namesQuery.current.includes(element.uid)) {
              namesQuery.current.push(element.uid);
              getDoc(doc(db, "users", element.uid)).then((res) => {
                setUserNames((prev) => ({
                  ...prev,
                  [element.uid]: res.data(),
                }));
              });
            }
            return (
              <TableRow key={element.uid}>
                <TableCell>{element.created}</TableCell>
                <TableCell>{element.uid}</TableCell>
                <TableCell>{userNames[element.uid]?.name}</TableCell>
                <TableCell>{userNames[element.uid]?.role}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="grid place-items-center mt-2">
        {tableQuerying || error.isError ? (
          tableQuerying ? (
            "loading"
          ) : (
            error.message
          )
        ) : (
          <Button
            onClick={handleLoadMore}
            disabled={tableQuerying || !nextPageToken.current}
            variant="outline"
          >
            Load More
          </Button>
        )}
      </div>
      <NewDialog
        open={showNewDialog}
        set={setShowNewDialog}
        reload={initialize}
      ></NewDialog>
    </>
  );
}

const NewDialog = ({ children, set, reload, ...props }) => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({
    email: "",
    name: "",
    password: "",
    role: "default",
  });

  const router = useRouter();
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      setData({
        email: "",
        name: "",
        role: "default",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.disabled = true;

    if (data.name != "" && data.email != "" && data.password.length >= 6) {
      try {
        auth.currentUser.getIdToken(true).then(function (idToken) {
          return fetch("/api/create-user", {
            method: "POST",
            body: JSON.stringify({
              token: idToken,
              email: data.email,
              name: data.name,
              role: data.role,
              password: data.password,
            }),
          });
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
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <form className="mt-4 grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="text"
              value={data.email}
              onChange={(e) => {
                setData({ ...data, email: e.target.value });
              }}
            />
          </div>
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
            <Label className="text-right">Password</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="password"
              value={data.password}
              onChange={(e) => {
                setData({ ...data, password: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <select
              name=""
              id=""
              value={data.role}
              onChange={(e) => {
                setData({ ...data, role: e.target.value });
              }}
            >
              <option value="default">Default</option>
              <option value="admin">Admin</option>
            </select>
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

export default Manage;
