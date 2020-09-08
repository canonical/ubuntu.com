"""add_cve_patch_column

Revision ID: 10c24cb270ff
Revises: 765ed540939b
Create Date: 2020-08-20 14:53:19.249005

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "10c24cb270ff"
down_revision = "765ed540939b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "cve",
        sa.Column("patches", sa.JSON(), nullable=True),
    )
    op.add_column(
        "cve",
        sa.Column("tags", sa.JSON(), nullable=True),
    )


def downgrade():
    op.drop_column("cve", "patches")
    op.drop_column("cve", "tags")
