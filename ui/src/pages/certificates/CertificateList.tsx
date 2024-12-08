import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, notification, Space, Table, Tooltip, Typography, type TableProps } from "antd";
import { PageHeader } from "@ant-design/pro-components";
import { Eye as EyeIcon } from "lucide-react";
import moment from "moment";

import CertificateDetailDrawer from "@/components/certificate/CertificateDetailDrawer";
import { Certificate as CertificateType } from "@/domain/certificate";
import { list as listCertificate, type CertificateListReq } from "@/repository/certificate";
import { diffDays, getLeftDays } from "@/lib/time";

const CertificateList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

  // a flag to fix the twice-rendering issue in strict mode
  const mountRef = useRef(true);

  const [notificationApi, NotificationContextHolder] = notification.useNotification();

  const [loading, setLoading] = useState<boolean>(false);

  const tableColumns: TableProps<CertificateType>["columns"] = [
    {
      key: "$index",
      align: "center",
      title: "",
      width: 50,
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "name",
      title: t("certificate.props.domain"),
      render: (_, record) => <Typography.Text>{record.san}</Typography.Text>,
    },
    {
      key: "expiry",
      title: t("certificate.props.expiry"),
      render: (_, record) => {
        const leftDays = getLeftDays(record.expireAt);
        const allDays = diffDays(record.expireAt, record.created);
        return (
          <Space className="max-w-full" direction="vertical" size={4}>
            {leftDays > 0 ? (
              <Typography.Text type="success">
                {leftDays} / {allDays} {t("certificate.props.expiry.days")}
              </Typography.Text>
            ) : (
              <Typography.Text type="danger">{t("certificate.props.expiry.expired")}</Typography.Text>
            )}

            <Typography.Text type="secondary">
              {moment(record.expireAt).format("YYYY-MM-DD")} {t("certificate.props.expiry.text.expire")}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      key: "source",
      title: t("certificate.props.source"),
      render: (_, record) => {
        const workflowId = record.workflow;
        return workflowId ? (
          <Space className="max-w-full" direction="vertical" size={4}>
            <Typography.Text>{t("common.text.workflow")}</Typography.Text>
            <Typography.Link
              type="secondary"
              ellipsis
              onClick={() => {
                navigate(`/workflows/detail?id=${workflowId}`);
              }}
            >
              {record.expand?.workflow?.name ?? ""}
            </Typography.Link>
          </Space>
        ) : (
          <>TODO: 支持手动上传</>
        );
      },
    },
    {
      key: "createdAt",
      title: t("common.text.created_at"),
      ellipsis: true,
      render: (_, record) => {
        return moment(record.created!).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      key: "updatedAt",
      title: t("common.text.updated_at"),
      ellipsis: true,
      render: (_, record) => {
        return moment(record.updated!).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      key: "$action",
      align: "end",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title={t("certificate.action.view")}>
            <Button
              type="link"
              icon={<EyeIcon size={16} />}
              onClick={() => {
                handleViewClick(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const [tableData, setTableData] = useState<CertificateType[]>([]);
  const [tableTotal, setTableTotal] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchTableData = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const state = searchParams.get("state");
    const req: CertificateListReq = { page: page, perPage: pageSize };
    if (state) {
      req.state = state as CertificateListReq["state"];
    }

    try {
      const resp = await listCertificate(req);

      setTableData(resp.items);
      setTableTotal(resp.totalItems);
    } catch (err) {
      console.error(err);
      notificationApi.error({ message: t("common.text.request_error"), description: <>{String(err)}</> });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current = false;
      return;
    }

    fetchTableData();
  }, [fetchTableData]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CertificateType>();

  const handleViewClick = (certificate: CertificateType) => {
    setDrawerOpen(true);
    setCurrentRecord(certificate);
  };

  // TODO: 响应式表格

  return (
    <>
      {NotificationContextHolder}

      <PageHeader title={t("certificate.page.title")} />

      <Table<CertificateType>
        columns={tableColumns}
        dataSource={tableData}
        loading={loading}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("certificate.nodata")} />,
        }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: tableTotal,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
          onShowSizeChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        rowKey={(record) => record.id}
      />

      <CertificateDetailDrawer
        data={currentRecord}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCurrentRecord(undefined);
        }}
      />
    </>
  );
};

export default CertificateList;
