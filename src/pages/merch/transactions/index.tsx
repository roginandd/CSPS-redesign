import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import { PurchaseCard } from "./components/PurchaseCard";
import { PurchaseFilter } from "./components/PurchaseFilter";
import Pagination from "./components/Pagination";
import { getMyOrders, getOrderItemByStatus, cancelOrder } from "../../../api/order";
import type {
  OrderResponse,
  PaginatedOrdersResponse,
  OrderItemResponse,
} from "../../../interfaces/order/OrderResponse";
import { OrderStatus } from "../../../enums/OrderStatus";
import type { PaginationParams } from "../../../interfaces/pagination_params";
import { FiSearch } from "react-icons/fi";
import Layout from "../../../components/Layout";
import { toast } from "sonner";
import CancelOrderModal from "./components/CancelOrderModal";

const groupOrderItemsByOrder = (
  orderItems: OrderItemResponse[],
): OrderResponse[] => {
  const groupedOrders: Record<number, OrderResponse> = {};

  orderItems.forEach((item) => {
    if (!groupedOrders[item.orderId]) {
      groupedOrders[item.orderId] = {
        orderId: item.orderId,
        studentName: item.studentName,
        totalPrice: 0,
        orderDate: item.createdAt,
        orderStatus: item.orderStatus,
        orderItems: [],
      };
    }

    groupedOrders[item.orderId].orderItems.push(item);
    groupedOrders[item.orderId].totalPrice += item.totalPrice;
  });

  return Object.values(groupedOrders).sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
};

const Index = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [paginationInfo, setPaginationInfo] =
    useState<PaginatedOrdersResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const openCancelModal = (orderId: number) => {
    setOrderToCancel(orderId);
    setIsCancelModalOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setCancellingOrderId(orderId);
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                orderStatus: OrderStatus.CANCELLED,
                orderItems: order.orderItems.map((item) => ({
                  ...item,
                  orderStatus: OrderStatus.CANCELLED,
                })),
              }
            : order,
        ),
      );

      closeCancelModal();
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (error.response?.status === 400) {
        // check if order is already in a non-cancellable state
        const message = error.response.data?.message || "";
        if (message.includes("TO_BE_CLAIMED") || message.includes("ready")) {
          toast.error("Cannot cancel - order is ready for pickup");
        } else if (message.includes("CLAIMED")) {
          toast.error("Cannot cancel - order already claimed");
        } else {
          toast.error(message || "Order can no longer be cancelled");
        }
        window.location.reload();
      } else if (error.response?.status === 404) {
        toast.error("Order not found");
        window.location.reload();
      } else {
        toast.error("Failed to cancel order. Please try again.");
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (selectedStatus === "All") {
          const response = await getMyOrders({
            page: currentPage,
            size: pageSize,
          } as PaginationParams);

          setOrders(Array.isArray(response.content) ? response.content : []);
          setPaginationInfo(response);
        } else {
          const fetchedItems = await getOrderItemByStatus(
            selectedStatus as OrderStatus,
          );

          setOrders(groupOrderItemsByOrder(fetchedItems.content || []));
          setPaginationInfo(null);
        }

        setError(null);
      } catch {
        setError("Failed to load purchases. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, selectedStatus]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    if (!searchQuery.trim()) {
      return orders;
    }

    const normalizedQuery = searchQuery.toLowerCase();

    return orders.filter(
      (order) =>
        order.studentName.toLowerCase().includes(normalizedQuery) ||
        order.orderId.toString().includes(normalizedQuery) ||
        order.orderItems.some(
          (item) =>
            item.merchName.toLowerCase().includes(normalizedQuery) ||
            item.studentName.toLowerCase().includes(normalizedQuery) ||
            item.studentId.toLowerCase().includes(normalizedQuery),
        ),
    );
  }, [orders, searchQuery]);

  return (
    <Layout>
      <AuthenticatedNav />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-16">
        <header className="mb-8 sm:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            My Purchases
          </h1>
          <p className="text-white/40 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            Transaction History
          </p>
        </header>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] backdrop-blur-md relative z-10">
          <PurchaseFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <div className="relative w-full lg:max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl sm:rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Loading Records
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 text-center">
            <p className="text-red-400 text-sm sm:font-medium">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#242050]/50 border border-white/5 rounded-2xl sm:rounded-[3rem] py-24 sm:py-32 text-center">
            <p className="text-white/20 text-lg sm:text-xl font-bold italic px-4">
              No records found.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {filteredOrders.map((purchase) => (
              <section key={purchase.orderId} className="group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 min-w-[20px] bg-white/5 sm:hidden" />
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm font-semibold">
                    Order: <span className="text-white font-bold">#{purchase.orderId}</span>
                  </p>
                  <div className="hidden sm:block h-[1px] flex-1 mx-6 bg-white/5" />

                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <p className="text-white/60 text-xs sm:text-sm font-semibold">
                      Total:{" "}
                      <span className="text-white font-bold">
                        PHP {purchase.totalPrice.toFixed(2)}
                      </span>
                    </p>
                    {purchase.orderStatus === OrderStatus.PENDING && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(purchase.orderId)}
                        disabled={cancellingOrderId === purchase.orderId}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12072f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingOrderId === purchase.orderId
                          ? "Cancelling..."
                          : "Cancel order"}
                      </button>
                    )}
                  </div>
                </div>

                <PurchaseCard purchase={purchase} />
              </section>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          paginationInfo &&
          paginationInfo.totalPages > 1 && (
            <div className="mt-12 sm:mt-16 flex justify-center scale-90 sm:scale-100">
              <Pagination
                currentPage={currentPage}
                totalPages={paginationInfo.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
      </div>

      {isCancelModalOpen && orderToCancel && (
        <CancelOrderModal
          orderId={orderToCancel}
          isLoading={cancellingOrderId === orderToCancel}
          onClose={closeCancelModal}
          onConfirm={handleCancelOrder}
        />
      )}
    </Layout>
  );
};

export default Index;
