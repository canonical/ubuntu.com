"""update_cve_component_field

Revision ID: 570b8ff188c4
Revises: 765ed540939b
Create Date: 2020-08-25 13:52:15.173429

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "570b8ff188c4"
down_revision = "10c24cb270ff"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("status", "component")
    op.execute("DROP TYPE components")

    new_components_list = "'main', 'universe'"

    op.execute(f"CREATE TYPE components AS ENUM ({new_components_list});")

    op.add_column(
        "status",
        sa.Column(
            "component",
            sa.Enum("main", "universe", name="components"),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("status", "component")
    op.execute("DROP TYPE components;")

    old_components_list = "'main', 'universe', 'esm-infra', 'esm-apps'"

    op.execute(f"CREATE TYPE components AS ENUM ({old_components_list});")

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
