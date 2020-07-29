"""add component column to status table

Revision ID: 8e9386e7a94b
Revises: fc282ca1dc4d
Create Date: 2020-07-16 15:01:39.739465

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8e9386e7a94b"
down_revision = "fc282ca1dc4d"
branch_labels = None
depends_on = None


def upgrade():
    components_list = "'main', 'universe', 'esm-infra', 'esm-apps'"
    op.execute(f"CREATE TYPE components AS ENUM ({components_list});")

    op.add_column(
        "status",
        sa.Column(
            "component",
            sa.Enum(
                "main", "universe", "esm-infra", "esm-apps", name="components"
            ),
            nullable=False,
            server_default="main",
        ),
    )


def downgrade():
    op.drop_column("status", "component")
    op.execute("DROP TYPE components;")
