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
  const endOfQuery = useRef(false);
  const router = useRouter();
  const [userNames, setUserNames] = useState({});
  const namesQuery = useRef([]);

  const initialize = () => {
    setTableQuerying(true);
    loadQuery({
      collectionID: "logs",
      order: orderBy("created", "desc"),
      conditions: [],
    })
      .then((result) => {
        setTable(result.docs);
        setTableQuerying(false);
      })
      .catch((error) => {
        setError({ isError: true, message: error.message });
        setTableQuerying(false);
      });
  };

  const runOnce = useRef(true);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    } else {
      if (runOnce) {
        initialize();
        runOnce.current = false;
      }
    }
  }, []);

  const handleLoadMore = () => {
    setTableQuerying(true);
    loadQuery({
      collectionID: "logs",
      order: orderBy("created", "desc"),
      loadAfter: startAfter(table[table.length - 1]),
    }).then((result) => {
      setTable([...table, ...result.docs]);
      setTableQuerying(false);
      if (result.docs.length <= 0) {
        endOfQuery.current = true;
      }
    });
  };

  if (currentUser) {
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Time</TableHead>
              <TableHead className="w-[150px]">User</TableHead>
              <TableHead className="w-[150px]">Target</TableHead>
              <TableHead className="">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((element) => {
              if (!namesQuery.current.includes(element.data().userUID)) {
                namesQuery.current.push(element.data().userUID);
                getDoc(doc(db, "users", element.data().userUID)).then((res) => {
                  setUserNames((prev) => ({
                    ...prev,
                    [element.data().userUID]: res.data().name,
                  }));
                });
              }
              return (
                <TableRow key={element.id}>
                  <TableCell>
                    {format(element.data().created.toDate(), "Pp")}
                  </TableCell>
                  <TableCell>{userNames[element.data().userUID]}</TableCell>
                  <TableCell>
                    {typeof element.data().target == "object"
                      ? element.data().target.id
                      : element.data().target}
                  </TableCell>
                  <TableCell>{element.data().action.text}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="grid place-items-center mt-2">
          {tableQuerying || error.isError ? (
            tableQuerying ? (
              "Loading"
            ) : (
              error.message
            )
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
      </>
    );
  } else {
    return <>Not Authorized</>;
  }
}

export default Manage;
