from sqlalchemy import text


def initialize_database_objects(engine):
    with engine.begin() as connection:
        connection.execute(text("PRAGMA foreign_keys = ON"))

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_product
                ON inventory (warehouse_id, product_id)
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at
                ON stock_movements (created_at)
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
                ON inventory_audit_logs (created_at)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TRIGGER IF NOT EXISTS trg_inventory_insert_audit
                AFTER INSERT ON inventory
                BEGIN
                    INSERT INTO inventory_audit_logs (
                        inventory_id,
                        warehouse_id,
                        product_id,
                        action,
                        quantity_before,
                        quantity_after,
                        delta,
                        actor,
                        created_at
                    )
                    VALUES (
                        NEW.inventory_id,
                        NEW.warehouse_id,
                        NEW.product_id,
                        'INWARD',
                        0,
                        NEW.quantity,
                        NEW.quantity,
                        'trigger',
                        CURRENT_TIMESTAMP
                    );
                END
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TRIGGER IF NOT EXISTS trg_inventory_update_audit
                AFTER UPDATE OF quantity ON inventory
                BEGIN
                    INSERT INTO inventory_audit_logs (
                        inventory_id,
                        warehouse_id,
                        product_id,
                        action,
                        quantity_before,
                        quantity_after,
                        delta,
                        actor,
                        created_at
                    )
                    VALUES (
                        NEW.inventory_id,
                        NEW.warehouse_id,
                        NEW.product_id,
                        CASE
                            WHEN NEW.quantity > OLD.quantity THEN 'INWARD'
                            WHEN NEW.quantity < OLD.quantity THEN 'OUTWARD'
                            ELSE 'ADJUSTMENT'
                        END,
                        OLD.quantity,
                        NEW.quantity,
                        NEW.quantity - OLD.quantity,
                        'trigger',
                        CURRENT_TIMESTAMP
                    );
                END
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE VIEW IF NOT EXISTS vw_reorder_alerts AS
                SELECT
                    i.inventory_id,
                    i.warehouse_id,
                    w.name AS warehouse_name,
                    i.product_id,
                    p.name AS product_name,
                    i.quantity AS current_quantity,
                    p.reorder_level,
                    (p.reorder_level - i.quantity) AS shortage
                FROM inventory i
                JOIN products p ON p.product_id = i.product_id
                JOIN warehouses w ON w.warehouse_id = i.warehouse_id
                WHERE i.quantity <= p.reorder_level
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE VIEW IF NOT EXISTS vw_current_inventory AS
                SELECT
                    i.inventory_id,
                    i.warehouse_id,
                    w.name AS warehouse_name,
                    i.product_id,
                    p.name AS product_name,
                    p.sku,
                    i.quantity,
                    p.reorder_level
                FROM inventory i
                JOIN warehouses w ON w.warehouse_id = i.warehouse_id
                JOIN products p ON p.product_id = i.product_id
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE VIEW IF NOT EXISTS vw_vendor_purchase_summary AS
                SELECT
                    v.vendor_id,
                    v.name AS vendor_name,
                    COUNT(DISTINCT po.po_id) AS total_purchase_orders,
                    COALESCE(SUM(poi.quantity * poi.price), 0) AS total_purchase_value
                FROM vendors v
                LEFT JOIN purchase_orders po ON po.vendor_id = v.vendor_id
                LEFT JOIN purchase_order_items poi ON poi.po_id = po.po_id
                GROUP BY v.vendor_id, v.name
                """
            )
        )
