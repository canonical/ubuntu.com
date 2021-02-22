"""add-cve-mitigation-column

Revision ID: 3e0a3f15abb9
Revises: 0fe2f3a871da
Create Date: 2021-01-27 14:49:50.869752

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3e0a3f15abb9"
down_revision = "0fe2f3a871da"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("cve", sa.Column("mitigation", sa.String(), nullable=True))


def downgrade():
    op.drop_column("cve", "mitigation")
