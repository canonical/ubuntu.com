"""add_is_hidden_column_for_notices

Revision ID: 8008e46e6ea8
Revises: 3e0a3f15abb9
Create Date: 2021-02-19 12:39:11.459139

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8008e46e6ea8"
down_revision = "3e0a3f15abb9"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "notice",
        sa.Column(
            "is_hidden",
            sa.Boolean(),
            nullable=False,
            server_default="False",
        ),
    )


def downgrade():
    op.drop_column("notice", "is_hidden")
