import { useState, useEffect } from "react";

import {
    Tabs,
    Button,
    Modal,
    Input,
    Select,
    Collapse,
    Space,
    ConfigProvider,
    Empty,
    Radio,
    Switch,
} from "antd";

import {
    PlusOutlined,
    SaveOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    TruckOutlined,
    BellOutlined,
} from "@ant-design/icons";

const PRIMARY_COLOR = "#2a3b5a";


const BUTTON_STYLE = {
    height: 40,
};

const ACTION_BUTTON_STYLE = {
    ...BUTTON_STYLE,
    width: 122,
};

const ICON_BUTTON_STYLE = {
    width: 40,
    height: 40,
    padding: 0,
};

function Carrier() {
    // =========================
    // Carrier State
    // =========================

    const [carriers, setCarriers] = useState([
        {
            id: 1,
            name: "Indiapost",
            active: true,
            timings: [
            ],


            notificationSettings: {
                warningTime: "",
                clearTime: "",
                notificationText: "",
                warningText: "",
                showPendingWarning: false,
            },
        },
        {
            id: 2,
            name: "Fed ex",
            active: true,
            timings: [],
            notificationSettings: {
                warningTime: "",
                clearTime: "",
                notificationText: "",
                warningText: "",
                showPendingWarning: false,

            },
        },
        {
            id: 3,
            name: "Bluedart",
            active: true,
            timings: [],
            notificationSettings: {
                warningTime: "",
                clearTime: "",
                notificationText: "",
                warningText: "",
                showPendingWarning: false,
            },
        },
        {
            id: 4,
            name: "Amazon",
            active: true,
            timings: [],
            notificationSettings: {
                warningTime: "",
                clearTime: "",
                notificationText: "",
                warningText: "",
                showPendingWarning: false,
            },

        },
    ]);



    const [carrierModalOpen, setCarrierModalOpen] = useState(false);

    const [carrierName, setCarrierName] = useState("");

    const [activeStatus, setActiveStatus] = useState(true);

    const [editingCarrier, setEditingCarrier] = useState(null);


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [carrierToDelete, setCarrierToDelete] = useState(null);



    const [timingModalOpen, setTimingModalOpen] = useState(false);

    const [selectedCarrier, setSelectedCarrier] = useState(null);

    const [editingTiming, setEditingTiming] = useState(null);

    const [timingLabel, setTimingLabel] = useState("");

    const [pickupHour, setPickupHour] = useState("");

    const [pickupMinute, setPickupMinute] = useState("");

    const [pickupPeriod, setPickupPeriod] = useState("AM");


    useEffect(() => {
        console.log("Carrier Name Changed:", carrierName);
    }, [carrierName]);


    const openAddCarrierModal = () => {
        setEditingCarrier(null);
        setCarrierName("");
        setActiveStatus(true);
        setCarrierModalOpen(true);
    };



    const openEditCarrierModal = (carrier) => {
        setEditingCarrier(carrier);
        setCarrierName(carrier.name);
        setActiveStatus(carrier.active);
        setCarrierModalOpen(true);
    };



    const saveCarrier = () => {
        if (!carrierName.trim()) {
            return;
        }

        if (editingCarrier) {
            setCarriers((previousCarriers) =>
                previousCarriers.map((carrier) =>
                    carrier.id === editingCarrier.id
                        ? {
                            ...carrier,
                            name: carrierName,
                            active: activeStatus,
                        }
                        : carrier
                )
            );
        } else {
            const newCarrier = {
                id: Date.now(),
                name: carrierName,
                active: activeStatus,
                timings: [],

                notificationSettings: {
                    warningTime: "",
                    clearTime: "",
                    notificationText: "",
                    warningText: "",
                    showPendingWarning: false,

                },
            };

            setCarriers((previousCarriers) => [
                ...previousCarriers,
                newCarrier,
            ]);
        }

        setCarrierModalOpen(false);
        setCarrierName("");
        setActiveStatus(true);
        setEditingCarrier(null);
    };


    const openDeleteModal = (carrier) => {
        setCarrierToDelete(carrier);
        setDeleteModalOpen(true);
    };


    const handleDelete = () => {
        if (!carrierToDelete) {
            return;
        }

        setCarriers((previousCarriers) =>
            previousCarriers.filter(
                (carrier) => carrier.id !== carrierToDelete.id
            )
        );

        setDeleteModalOpen(false);
        setCarrierToDelete(null);
    };


    const openAddTimingModal = (carrier) => {
        setSelectedCarrier(carrier);
        setEditingTiming(null);

        setTimingLabel("");
        setPickupHour("");
        setPickupMinute("");
        setPickupPeriod("AM");

        setTimingModalOpen(true);
    };




    const openEditTimingModal = (carrier, timing) => {
        setSelectedCarrier(carrier);
        setEditingTiming(timing);

        setTimingLabel(timing.label);
        setPickupHour(timing.hour);
        setPickupMinute(timing.minute);
        setPickupPeriod(timing.period);

        setTimingModalOpen(true);
    };

    // =========================
    // Save Timing
    // =========================

    const saveTiming = () => {
        if (
            !timingLabel ||
            !pickupHour ||
            !pickupMinute ||
            !pickupPeriod
        ) {
            return;
        }

        const timingData = {
            id: editingTiming ? editingTiming.id : Date.now(),
            label: timingLabel,
            hour: pickupHour,
            minute: pickupMinute,
            period: pickupPeriod,
        };

        setCarriers((previousCarriers) =>
            previousCarriers.map((carrier) => {
                if (carrier.id !== selectedCarrier.id) {
                    return carrier;
                }

                if (editingTiming) {
                    return {
                        ...carrier,
                        timings: carrier.timings.map((timing) =>
                            timing.id === editingTiming.id
                                ? timingData
                                : timing
                        ),
                    };
                }

                return {
                    ...carrier,
                    timings: [...carrier.timings, timingData],
                };
            })
        );

        setTimingModalOpen(false);

        setSelectedCarrier(null);
        setEditingTiming(null);

        setTimingLabel("");
        setPickupHour("");
        setPickupMinute("");
        setPickupPeriod("AM");
    };

    // =========================
    // Delete Timing
    // =========================

    const deleteTiming = (carrierId, timingId) => {
        setCarriers((previousCarriers) =>
            previousCarriers.map((carrier) =>
                carrier.id === carrierId
                    ? {
                        ...carrier,
                        timings: carrier.timings.filter(
                            (timing) => timing.id !== timingId
                        ),
                    }
                    : carrier
            )
        );
    };

    //NEW:
    //UPDATE NOTIFICATION SETTINGS

    const updateNotificationSettings = (
        carrierId,
        field,
        value
    ) => {
        setCarriers((previousCarriers) =>
            previousCarriers.map((carrier) => {
                if (carrier.id !== carrierId) {
                    return carrier;
                }
                return {
                    ...carrier,

                    notificationSettings: {
                        ...carrier.notificationSettings,
                        [field]: value,
                    },
                };
            })
        );
    };
    //UI
    //
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: PRIMARY_COLOR,
                    borderRadius: 6,
                },
            }}
        >
            <div
                style={{
                    width: "100%",
                    background: "#ffffff",
                }}
            >
                {/* =========================
            Carrier Tabs
        ========================= */}

                <Tabs
                    activeKey="carrier"
                    items={[
                        {
                            key: "carrier",
                            label: "Carrier",
                        },
                    ]}
                    tabBarExtraContent={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAddCarrierModal}
                            style={{
                                ...ACTION_BUTTON_STYLE,
                                backgroundColor: PRIMARY_COLOR,
                                borderColor: PRIMARY_COLOR,
                            }}
                        >
                            Add Carrier
                        </Button>
                    }
                />

                {carriers.length === 0 ? (
                    <Empty description="No carriers available" />
                ) : (
                    <Collapse
                        bordered={false}
                        expandIconPlacement="end"
                        items={carriers.map((carrier) => ({
                            key: carrier.id,
                            label: (
                                <div className="carrier-panel-header">
                                    <div>
                                        <div className="carrier-panel-name">
                                            {carrier.name}
                                            <span
                                                className={`carrier-status ${carrier.active ? "active" : "inactive"}`}
                                            >
                                                {carrier.active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="carrier-timing-count">
                                            {carrier.timings.length} Pickup Timing{carrier.timings.length === 1 ? "" : "s"}
                                        </div>
                                    </div>

                                    <Space
                                        size={8}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <Button
                                            className="carrier-icon-button"
                                            icon={<EditOutlined />}
                                            aria-label={`Edit ${carrier.name}`}
                                            title={`Edit ${carrier.name}`}
                                            style={ICON_BUTTON_STYLE}
                                            onClick={() => openEditCarrierModal(carrier)}
                                        />
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            aria-label={`Delete ${carrier.name}`}
                                            title={`Delete ${carrier.name}`}
                                            style={ICON_BUTTON_STYLE}
                                            onClick={() => openDeleteModal(carrier)}
                                        />
                                    </Space>
                                </div>
                            ),
                            children: (
                                <div className="carrier-panel-content">
                                    <div className="carrier-timing-heading">
                                        <strong>Pickup Timings</strong>
                                        <Button
                                            type="primary"
                                            icon={<ClockCircleOutlined />}
                                            style={{
                                                ...ACTION_BUTTON_STYLE,
                                                backgroundColor: PRIMARY_COLOR,
                                                borderColor: PRIMARY_COLOR,
                                            }}
                                            onClick={() => openAddTimingModal(carrier)}
                                        >
                                            Add Timing
                                        </Button>
                                    </div>

                                    {carrier.timings.length === 0 ? (
                                        <div className="carrier-empty-timings">
                                            No timing added
                                        </div>
                                    ) : (
                                        <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                                            {carrier.timings.map((timing) => (
                                                <div className="carrier-timing-row" key={timing.id}>
                                                    <span>
                                                        <ClockCircleOutlined />
                                                        {timing.hour}:{timing.minute} {timing.period}
                                                        <span className="carrier-timing-label">
                                                            {timing.label}
                                                        </span>
                                                    </span>
                                                    <Button
                                                        danger
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        aria-label={`Delete ${timing.label} timing`}
                                                        title={`Delete ${timing.label} timing`}
                                                        onClick={() => deleteTiming(carrier.id, timing.id)}
                                                    />
                                                </div>
                                            ))}
                                        </Space>
                                    )}

                                    <div className="notification-settings">
                                        <div className="carrier-notification-title">
                                            <BellOutlined />
                                            <strong>Carrier Notification Settings</strong>
                                        </div>

                                        <div className="notification-setting-row">
                                            <div className="notification-setting-label">
                                                <div className="carrier-form-label">Warning Time</div>
                                            </div>
                                            <Input
                                                type="time"
                                                value={carrier.notificationSettings?.warningTime || ""}
                                                onChange={(event) =>
                                                    updateNotificationSettings(
                                                        carrier.id,
                                                        "warningTime",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="notification-setting-row">
                                            <div className="notification-setting-label">
                                                <div className="carrier-form-label">Clear Time</div>
                                            </div>
                                            <Input
                                                type="time"
                                                value={carrier.notificationSettings?.clearTime || ""}
                                                onChange={(event) =>
                                                    updateNotificationSettings(
                                                        carrier.id,
                                                        "clearTime",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="notification-setting-row">
                                            <div className="notification-setting-label">
                                                <div className="carrier-form-label">Notification</div>
                                            </div>
                                            <Input
                                                placeholder="Enter notification text"
                                                value={carrier.notificationSettings?.notificationText || ""}
                                                onChange={(event) =>
                                                    updateNotificationSettings(
                                                        carrier.id,
                                                        "notificationText",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="notification-setting-row">
                                            <div className="notification-setting-label">
                                                <div className="carrier-form-label">Warning</div>
                                            </div>
                                            <Input
                                                placeholder="Enter warning text"
                                                value={carrier.notificationSettings?.warningText || ""}
                                                onChange={(event) =>
                                                    updateNotificationSettings(
                                                        carrier.id,
                                                        "warningText",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="pending-warning-setting">
                                            <div className="notification-setting-label">
                                                <div className="carrier-form-label">Show Warning on Pending Screen</div>
                                            </div>
                                            <Switch
                                                checked={carrier.notificationSettings?.showPendingWarning || false}
                                                onChange={(checked) =>
                                                    updateNotificationSettings(
                                                        carrier.id,
                                                        "showPendingWarning",
                                                        checked
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                )}


                {/* =========================
                Add / Edit Carrier Modal
                ========================= */}

                <Modal
                    className="carrier-form-modal"
                    title={
                        <div className="carrier-modal-title">
                            <div className="carrier-modal-icon">
                                <TruckOutlined />
                            </div>

                            <div>
                                <div className="carrier-modal-heading">
                                    {editingCarrier ? "Edit Carrier" : "Add Carrier"}
                                </div>

                                <div className="carrier-modal-subtitle">
                                    {editingCarrier
                                        ? "Update the carrier details and status."
                                        : "Add a new carrier and configure its status."}
                                </div>
                            </div>
                        </div>
                    }
                    open={carrierModalOpen}
                    width={440}
                    onCancel={() => setCarrierModalOpen(false)}

                    footer={[
                        <Button
                            key="cancel"
                            className="carrier-cancel-button"
                            onClick={() => setCarrierModalOpen(false)}
                            style={{
                                ...BUTTON_STYLE,
                                width: 112,
                                color: "#333",
                                borderColor: "#d9d9d9",
                                background: "#ffffff",
                            }}
                        >
                            Cancel
                        </Button>,

                        <Button
                            key="save"
                            className="carrier-save-button"
                            type="primary"
                            icon={<SaveOutlined style={{ color: PRIMARY_COLOR }} />}
                            onClick={saveCarrier}
                            style={{
                                ...BUTTON_STYLE,
                                width: 112,
                                color: "#ffffff",
                                backgroundColor: "#000000",
                                borderColor: "#000000",
                            }}
                        >
                            {editingCarrier ? "Update" : "Save Changes"}
                        </Button>,
                    ]}
                >
                    <div
                        className="carrier-form-section">
                        <div
                            className="carrier-form-label">
                            Carrier Name <span>*</span>
                        </div>
                        <Input
                            prefix={<TruckOutlined />}
                            placeholder="Enter carrier name"
                            value={carrierName}
                            onChange={(event) => {
                                setCarrierName(event.target.value);
                                console.log("Carrier Name:", event.target.value);
                            }}
                        />
                    </div>

                    {/* Status */}
                    <div className="carrier-form-section">
                        <div className="carrier-form-label">
                            Status Configuration <span>*</span>
                        </div>

                        <div className="carrier-form-help">
                            Set whether this carrier is currently available for
                            pickups.
                        </div>

                        <Radio.Group
                            value={activeStatus}
                            onChange={(event) =>
                                setActiveStatus(event.target.value)
                            }
                            className="carrier-status-options"
                        >
                            <Radio value={true}>
                                <strong>Active</strong>
                                <span>Carrier is available for pickups</span>
                            </Radio>

                            <Radio value={false}>
                                <strong>Inactive</strong>
                                <span>Carrier is not available for pickups</span>
                            </Radio>
                        </Radio.Group>
                    </div>
                </Modal>


                <Modal
                    className="delete-carrier-modal"
                    title={
                        <div className="delete-modal-title">
                            <div className="delete-modal-icon">
                                <DeleteOutlined />
                            </div>
                            <div>
                                <div className="delete-modal-heading">
                                    Delete Carrier?
                                </div>
                                <div className="delete-modal-message">
                                    Are you sure you want to delete {carrierToDelete?.name}?
                                </div>
                            </div>
                        </div>
                    }
                    open={deleteModalOpen}
                    width={440}
                    onCancel={() => {
                        setDeleteModalOpen(false);
                        setCarrierToDelete(null);
                    }}
                    footer={[
                        <Button
                            key="cancel"
                            className="carrier-cancel-button"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setCarrierToDelete(null);
                            }}
                            style={{
                                ...BUTTON_STYLE,
                                color: "#333",
                                borderColor: "#d9d9d9",
                                background: "#ffffff",
                            }}
                        >
                            Cancel
                        </Button>,

                        <Button
                            key="delete"
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                            style={BUTTON_STYLE}
                        >
                            Delete
                        </Button>,
                    ]}
                >
                    <div className="delete-modal-body" />
                </Modal>

                {/* =========================
            Add / Edit Timing Modal
        ========================= */}

                <Modal
                    className="timing-form-modal"
                    title={
                        <div className="carrier-modal-title">
                            <div className="carrier-modal-icon">
                                <ClockCircleOutlined />
                            </div>
                            <div>
                                <div className="carrier-modal-heading">
                                    {editingTiming
                                        ? "Edit Timing"
                                        : "Add Timing"}
                                </div>

                                <div className="carrier-modal-subtitle">
                                    {editingTiming
                                        ? "Update the pickup timing for this carrier."
                                        : "Add a pickup timing for this carrier."}
                                </div>
                            </div>
                        </div>

                    }
                    open={timingModalOpen}
                    width={440}
                    onCancel={() => setTimingModalOpen(false)}
                    footer={[
                        <Button
                            key="cancel"
                            className="carrier-cancel-button"
                            onClick={() => setTimingModalOpen(false)}
                            style={{
                                ...BUTTON_STYLE,
                                color: "#333",
                                borderColor: "#d9d9d9",
                                background: "#ffffff",
                            }}
                        >
                            Cancel
                        </Button>,

                        <Button
                            key="save"
                            type="primary"
                            icon={<SaveOutlined style={{ color: PRIMARY_COLOR }} />}
                            onClick={saveTiming}
                            style={{
                                ...BUTTON_STYLE,
                                backgroundColor: PRIMARY_COLOR,
                                borderColor: PRIMARY_COLOR,
                            }}
                        >
                            {editingTiming ? "Update" : "Save"}
                        </Button>,
                    ]}
                >
                    {/* Schedule Label */}

                    <div className="carrier-form-section">
                        <div className="carrier-form-label">
                            Schedule Label <span>*</span>
                        </div>

                        <Select
                            placeholder="Select schedule"
                            value={timingLabel || undefined}
                            onChange={setTimingLabel}
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                {
                                    value: "Morning",
                                    label: "Morning",
                                },
                                {
                                    value: "Afternoon",
                                    label: "Afternoon",
                                },
                                {
                                    value: "Evening",
                                    label: "Evening",
                                },
                            ]}
                        />
                    </div>

                    {/* Pickup Time */}

                    <div className="carrier-form-section">
                        <div className="carrier-form-label">
                            Pickup Time <span>*</span>
                        </div>

                        <div className="carrier-form-help">
                            Specify the hours and minutes for this
                            schedule.
                        </div>

                        <Space.Compact style={{ width: "100%" }}>
                            <Input
                                prefix={<ClockCircleOutlined />}
                                placeholder="Hour"
                                value={pickupHour}
                                onChange={(event) =>
                                    setPickupHour(event.target.value)
                                }
                                style={{ width: "33.33%" }}
                            />

                            <Input
                                placeholder="Minutes"
                                value={pickupMinute}
                                onChange={(event) =>
                                    setPickupMinute(event.target.value)
                                }
                                style={{ width: "33.33%" }}
                            />

                            <Select
                                value={pickupPeriod}
                                onChange={setPickupPeriod}
                                style={{ width: "33.33%" }}
                                options={[
                                    {
                                        value: "AM",
                                        label: "AM",
                                    },
                                    {
                                        value: "PM",
                                        label: "PM",
                                    },
                                ]}
                            />
                        </Space.Compact>
                    </div>
                </Modal>
            </div>

        </ConfigProvider>
    );
}
export default Carrier;


