"""add-cve-pocket-column

Revision ID: 88f1398da6c1
Revises: 570b8ff188c4
Create Date: 2020-08-25 16:39:40.109172

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "88f1398da6c1"
down_revision = "570b8ff188c4"
branch_labels = None
depends_on = None


def upgrade():
    pockets_list = "'security', 'updates', 'esm-infra', 'esm-apps'"
    op.execute(f"CREATE TYPE pockets AS ENUM ({pockets_list});")

    op.add_column(
        "status",
        sa.Column(
            "pocket",
            sa.Enum(
                "security", "updates", "esm-infra", "esm-apps", name="pockets"
            ),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("status", "pocket")
    op.execute("DROP TYPE pockets;")
